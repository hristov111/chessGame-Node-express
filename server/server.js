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
        whiteTime: 600,
        blackTime: 600,
        currentTurn: 'white',
        interval: null,
    }


    timer.interval = setInterval(() => {
        if (timer.currentTurn === 'white') {
            timer.whiteTime--;
        } else {
            timer.blackTime--;
        }

        io.to(roomId).emit('timer-update', {
            whiteTime: timer.whiteTime,
            blackTime: timer.blackTime,
            turn: timer.currentTurn
        });


        if (timer.whiteTime <= 0 || timer.blackTime <= 0) {
            clearInterval(timer.interval);
            io.to(roomId).emit('game-ended', {
                reason: 'timeout',
                lose: timer.whiteTime <= 0 ? 'white' : 'black'
            });
            timers.delete(roomId);
        }
    }, 1000);
    timers.set(roomId, timer);
}

function flipIndex(idx) {
    const row = Math.floor(idx / 8);
    const col = idx % 8;
    const flippedRow = 7 - row;
    return flippedRow * 8 + col;
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


    socket.on("rejoin-room", ({ userId }) => {
        let roomId;
        console.log("rejoining");
        for (let [key, value] of chessGameState) {
            if (value.player1.id === userId || value.player2.id === userId) {
                roomId = key;
                break;
            }
        }
        console.log(roomId);
        if (roomId) {
            const game = chessGameState.get(roomId);
            console.log(game);
            let table;
            if (game.player1.id === userId) {
                if (game.player1.color === 'white') {
                    table = game.currentTableWhite;
                } else {
                    table = game.currentTableBlack;
                }
            } else if (game.player2.id === userId) {
                if (game.player2.color === 'white') {
                    table = game.currentTableWhite;
                } else {
                    table = game.currentTableBlack;
                }
            }
            if (game) {
                console.log(game);
                socket.join(roomId);
                let timer = timers.get(roomId);
                socket.emit("rejoined", {table,
                    roomId,
                    player1:game.player1,
                    player2:game.player2,
                    currentTurn:timer.currentTurn,
                    whiteTime:timer.whiteTime,
                    blackTime:timer.blackTime
                });
            }
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
                player1: { id: p1Id, color: 'white' },
                player2: { id: p2Id, color: 'black' },
                currentTableWhite: [],
                currentTableBlack: []
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
                console.log('starting game');
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


    socket.on('move', ({ roomId, move: { player, from, to }, table }) => {
        console.log("Moving: " + player);
        const game = chessGameState.get(roomId);
        if (game && player === 'white') {
            console.log("Set table white");
            game.currentTableWhite = table;
        }
        else if (game && player === 'black') {
            console.log("Set table black");
            game.currentTableBlack = table;
        }
        socket.to(roomId).emit('opponentMove', { from: flipIndex(from), to: flipIndex(to) });
        let timer = timers.get(roomId);
        timer.currentTurn = player === 'white' ? 'black' : 'white';
        timer.whiteTime = 600;
        timer.blackTime = 600;
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
httpServer.listen(3001, '0.0.0.0', () => {
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