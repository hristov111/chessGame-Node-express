const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const users = require("./routes/users");
const pages = require("./routes/pages");
const games = require("./routes/games");
const session = require('express-session');
const PORT = process.env.PORT || 5500;

const { Server } = require('socket.io');
const { createServer } = require('http');
const httpServer = createServer(app);
const io = new Server(httpServer);
//middleware
app.use(session({
    secret: 'kalata the dev',
    saveUninitialized: false, // don't save empty sessions
    resave: false,            // don't resave unmodified sessions
    rolling: true,            // refresh cookie expiration on each request
    cookie: {
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        httpOnly: true,         // protect from client-side JS
        secure: false           // set to true if using HTTPS
    }
}));
// array full of rooms
const startGameStatus = new Map();

let chessGameState = new Map();
const connectedUsers = new Map();
const waiting_players = new Map();

const timers = new Map();


const startServerTimer = (roomId) => {
    const timer = {
        whiteTime:600,
        blackTime:600,
        currentTurn: 'white',
        interval:null,
    }


    timer.interval = setInterval(() => {
        if(timer.currentTurn === 'white'){
            timer.whiteTime --;
        }else {
            timer.blackTime--;
        }

        io.to(roomId).emit('timer-update', {
            whiteTime: timer.whiteTime,
            blackTime:timer.blackTime,
        });


        if(timer.whiteTime <= 0 || timer.blackTime <= 0){
            clearInterval(timer.interval);
            io.to(roomId).emit('game-ended', {
                reason: 'timeout',
                lose: timer.whiteTime <= 0? 'white': 'black'
            });
            timers.delete(roomId);
        }
    },1000);
    timers.set(roomId,timer);
}

io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    if (userId === "undefined") {
        socket.disconnect();
        return next(new Error("Not authenticated"));

    }
    next();
})
io.on('connection', (socket) => {
    const userId = socket.handshake.query.Id;

    if (connectedUsers.has(userId)) {
        const oldSocket = connectedUsers.get(userId);
        oldSocket.disconnect();
        console.log(`Person ${userId} reconnected witn new socket ${socket.id}`);
    } else {
        console.log('New socket connected:', socket.id);

    }
    connectedUsers.set(userId, socket);
    // 1. Invite someone to a game \
    socket.on('send-invite', ({ toSocketId, from }) => {
        io.to(toSocketId).emit('receive-ivite', { from, fromSocketId: socket.id });
    })

    // 2. Accept Invite
    socket.on('accept-invite', ({ toSocketId, roomId }) => {
        socket.join(roomId);
        io.to(toSocketId).emit('invite-accepted', { roomId });
        io.to(toSocketId).socketsJoin(roomId); // mae both sockets join
    })

    // 3. decline invite
    socket.on('decline-invite', ({ toSocketId }) => {
        io.to(toSocketId).emit('invite-declined');
    })

    socket.on("get-roomId", ({ userId }) => {
        for (let [key, value] of chessGameState) {
            if (value.player1 === userId || value.player2 === userId) {
                socket.emit("roomId", ({ key }));
            }
        }
        socket.emit("roomId", (null));
    })

    socket.on("rejoin-room", ({ roomId, userId }) => {
        const game = chessGameState[roomId];
        if (game) {
            socket.join(roomId);
            socket.emit("rejoined", { ...game });
        }
    })
    // need to fetch current waiting list
    socket.on('find-game', async ({ userId }) => {
        // UPDATE DB

        console.log("Player:" + userId + " is searching for a game");
        waiting_players.set(userId, socket);

        // try to matcvh 
        if (waiting_players.size >= 2) {
            const [p1Id, p2Id] = [...waiting_players.keys()];
            const p1socket = waiting_players.get(p1Id);
            const p2socket = waiting_players.get(p2Id);
            console.log(p1Id, p2Id);

            const roomId = `${p1Id}-${p2Id}`;
            console.log(roomId);

            p1socket.join(roomId);
            p2socket.join(roomId);
            chessGameState.set(roomId, {
                player1: p1Id,
                player2: p2Id,
            });

            p1socket.emit('game-started', { roomId, opponentId: p2Id, color: 'black', opponent_color: "white", timer: true });
            p2socket.emit('game-started', { roomId, opponentId: p1Id, color: 'white', opponent_color: "black", timer: false });

            // UPDATE DB

            waiting_players.delete(p1Id);
            waiting_players.delete(p2Id);
        }
    })
    socket.on('start-game', ({ roomId, opponentId, color, opponent_color, timer }) => {
        if (!startGameStatus.has(roomId)) {
            startGameStatus.set(roomId, new Set());
        }


        const started = startGameStatus.get(roomId);
        started.add(socket.id);


        if (started.size === 2) {
            const [socketId1, socketId2] = [...started];


            const socket1 = io.sockets.sockets.get(socketId1);
            const socket2 = io.sockets.sockets.get(socketId2);


            if (socket1 && socket2) {
                socket1.emit('game-ready', {
                    roomId,
                    color,
                    opponent_color,
                    timer: true
                });

                socket2.emit('game-ready', {
                    roomId,
                    color: opponent_color,
                    opponent_color: color,
                    timer: false
                });
            }

            startGameStatus.delete(roomId);
            startServerTimer(roomId);

        }
    })

    socket.on('disconnect', () => {
        console.log("Socket disconnected", socket.id);
        for (const [userId, s] of waiting_players.entries()) {
            if (s === socket) {
                waiting_players.delete(userId);
                // UPDATE DB
                break;
            }
        }
    });


    socket.on('move', ({ roomId, from, to }) => {
        socket.to(roomId).emit('opponentMove', { from, to });
    })

    socket.on('resign', ({ roomId, reason }) => {
        io.to(roomId).emit('game-ended', { reason });
    })

})


app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/users', users);
app.use('/api/games', games);
app.use('/', pages);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
})
httpServer.listen(3000, '0.0.0.0', () => {
    console.log("Server running");
});


// const io = require('socket.io')(3000, {
//     cors: {
//         origin:"*"
//     }
// })


// io.on("connect", (socket) => {
//     console.log(`Client connected with id of: ${socket.id}`)
//     handleClientEvents(socket);
// })


// const handleClientEvents = socket => {

// }