const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const users = require("./routes/users");
const pages = require("./routes/pages");
const games = require("./routes/games");
const session = require('express-session');
const PORT = process.env.PORT || 5500;

const { updateGameSearchUser, updatePlayerActiveState, updatePlayerPlayingState } = require('./connect/usersDB');
const { registerGame, updateMoves, updateStatus, updateEndTime, updateWinner } = require('./connect/gamesDB');

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
const ROOMS = new Map();

const timers = new Map();

const getOthersocketInRoom = async (roomId, socket) => {
    const socketsInRoom = await io.in(roomId).fetchSockets();

    const otherSocket = socketsInRoom.find(s => s.id !== socket.id);
    if (otherSocket) return otherSocket;
    else return undefined;
}


const startServerTimer = (roomId) => {
    const game = chessGameState.get(roomId);
    const timer = {
        whiteTime: 600,
        blackTime: 600,
        currentTurn: game.currentTurn,
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
            // Switch turn based on current timer state, not stale game state
            timer.currentTurn = timer.currentTurn === 'white' ? 'black' : 'white';

            // Also update the game state
            const game = chessGameState.get(roomId);
            game.currentTurn = timer.currentTurn;

            io.to(roomId).emit('time-out', ({ currentTurn: game.currentTurn }));
            timer.whiteTime = 600;
            timer.blackTime = 600;

        }
    }, 1000);
    timers.set(roomId, timer);
}



const positionToAlgebraic = (idx) => {
    const file = 'abcdefgh'[idx % 8];
    const rank = 8 - Math.floor(idx / 8);
    return file + rank;
}

function flipIndex(idx) {
    const row = Math.floor(idx / 8);
    const col = idx % 8;
    const flippedRow = 7 - row;
    return flippedRow * 8 + col;
}

const endGame = async (socket, roomId, reason, winner) => {
    const otherSocket = await getOthersocketInRoom(roomId, socket);
    clearInterval(timers.get(roomId)?.interval);
    timers.delete(roomId);
    // 
    const id = ROOMS.get(roomId);
    await updateStatus(id, reason);
    await updateEndTime(id, new Date());
    await updateWinner(id, winner);
    await updatePlayerPlayingState(socket.userId, false);
    await updatePlayerPlayingState(otherSocket.userId, false);
    ROOMS.delete(roomId);
    chessGameState.delete(roomId)

    const room = io.sockets.adapter.rooms.get(roomId);

    if (room) {
        for (const socketId of room) {
            const socket = io.sockets.sockets.get(socketId);
            socket?.leave(room);
        }
    }

    startGameStatus.delete(roomId);


}

const changeTablePos = (table, from, to) => {
    const playerFrom = getElementFromTable(table, from);
    const playerTo = getElementFromTable(table, to);

    if (!playerFrom || !playerTo) {
        console.warn("Invalid move: one or both positions not found:", from, to);
        return;
    }

    playerTo.image_path = playerFrom.image_path;
    playerTo.color = playerFrom.color;
    playerTo.type = playerFrom.type;
    playerTo.enemy_color = playerFrom.enemy_color;

    playerFrom.image_path = '';
    playerFrom.color = '';
    playerFrom.type = '';
    playerFrom.enemy_color = '';

};

const changeTablePosObject = (table, from, to) => {
    const playerTo = getElementFromTable(table, to._position);
    playerTo.image_path = from.image_path;
    playerTo.color = from.color;
    playerTo.type = from.type;
    playerTo.enemy_color = from.enemy_color;
}

const getElementFromTable = (table, pos) => {
    for (let el of table) {
        if (Number(el._position) === Number(pos)) return el;
    }
    return undefined;
}

const addCaptured = (roomId, player, object) => {
    if (object.type !== '') {
        const game = chessGameState.get(roomId);
        const captured = player === 'white' ? game.capturedwhite : game.capturedBlack;
        captured.push(object);
    }
}

const checkIfPawnAtEnd = (roomId, socket, player,from, to) => {
    const game = chessGameState.get(roomId);
    const tableToCheck = player === 'white' ? game.currentTableWhite : game.currentTableBlack;
    const captured = player === 'white' ?  game.capturedBlack : game.capturedwhite;
    const toFig = getElementFromTable(tableToCheck, to);
    if (toFig.type === 'pawn' && (to >= 0 && to <= 7)) {
        // pawn is at end 
        console.log("pawn at end");
        socket.emit("pawnAtEnd", { roomId, player,from, posToSwap: toFig, captured: captured });
        return true;
    } else {
        return false;
    }

}

const addMovesForDisplayingPanel = (roomId, player, from, to) => {
    const game = chessGameState.get(roomId);
    if (player === "white") {
        game.movesWhite.push({ player, from: positionToAlgebraic(from), to: positionToAlgebraic(to) });
        game.movesBlack.push({ player, from: positionToAlgebraic(flipIndex(from)), to: positionToAlgebraic(flipIndex(to)) });
    } else if (player === 'black') {
        game.movesBlack.push({ player, from: positionToAlgebraic(from), to: positionToAlgebraic(to) });
        game.movesWhite.push({ player, from: positionToAlgebraic(flipIndex(from)), to: positionToAlgebraic(flipIndex(to)) });
    }
}

const addMovestoTable = (roomId, player, from, to, isObjects = false) => {
    console.log("Add Moves to table:",player,from,to,isObjects);
    const game = chessGameState.get(roomId);
    if (!isObjects) {
        if (player === 'white') {
            changeTablePos(game.currentTableWhite, from, to);
            changeTablePos(game.currentTableBlack, flipIndex(from), flipIndex(to));
        } else if (player === 'black') {
            changeTablePos(game.currentTableBlack, from, to);
            changeTablePos(game.currentTableWhite, flipIndex(from), flipIndex(to));

        }
    }else {
        const newTo = {...to, _position:flipIndex(to._position)}
        console.log(newTo);
         if (player === 'white') {
            changeTablePosObject(game.currentTableWhite, from, to);
            changeTablePosObject(game.currentTableBlack, from, newTo);
        } else if (player === 'black') {
            changeTablePosObject(game.currentTableBlack, from, to);
            changeTablePosObject(game.currentTableWhite, from, newTo);

        }
    }
};

const addMovesToDatabase = async (roomId, player, from, to, id) => {
    if (player === 'white') {
        await updateMoves
            (id, `${player.padEnd(6)} ${positionToAlgebraic(from)} ---> ${positionToAlgebraic(to)}`,
                `${player.padEnd(6)} ${positionToAlgebraic(flipIndex(from))} ---> ${positionToAlgebraic(flipIndex(to))}`)
    } else if (player === 'black') {
        await updateMoves
            (id, `${player.padEnd(6)} ${positionToAlgebraic(flipIndex(from))} ---> ${positionToAlgebraic(flipIndex(to))}`,
                `${player.padEnd(6)} ${positionToAlgebraic(from)} ---> ${positionToAlgebraic(to)}`)
    }

}


const updateTimer = (roomId, currentTurn) => {
    const game = chessGameState.get(roomId);
    let timer = timers.get(roomId);
    timer.currentTurn = currentTurn === 'white' ? 'black' : 'white';
    game.currentTurn = timer.currentTurn;
    timer.whiteTime = 600;
    timer.blackTime = 600;
}


io.use((socket, next) => {
    const userId = socket.handshake.query.userId;
    if (userId === "undefined") {
        socket.disconnect();
        return next(new Error("Not authenticated"));

    }
    next();
})
io.on('connection', async (socket) => {
    const userId = socket.handshake.query.Id;

    if (connectedUsers.has(userId)) {
        const oldSocket = connectedUsers.get(userId);
        oldSocket.disconnect();
        console.log(`Person ${userId} reconnected witn new socket ${socket.id}`);
    } else {
        console.log('New socket connected:', socket.id);

    }
    socket.userId = userId;
    connectedUsers.set(userId, socket);

    await updatePlayerActiveState(userId, true);

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
            let moves;
            if (game.player1.id === userId) {
                if (game.player1.color === 'white') {
                    table = game.currentTableWhite;
                    moves = game.movesWhite;
                } else {
                    table = game.currentTableBlack;
                    moves = game.movesBlack;
                }
            } else if (game.player2.id === userId) {
                if (game.player2.color === 'white') {
                    table = game.currentTableWhite;
                    moves = game.movesWhite;
                } else {
                    table = game.currentTableBlack;
                    moves = game.movesBlack;
                }
            }
            if (game) {
                socket.join(roomId);
                let timer = timers.get(roomId);
                socket.emit("rejoined", {
                    table,
                    moves,
                    roomId,
                    player1: game.player1,
                    player2: game.player2,
                    currentTurn: timer.currentTurn,
                    whiteTime: timer.whiteTime,
                    blackTime: timer.blackTime
                });
            }
        }
    })
    // need to fetch current waiting list
    socket.on('find-game', async ({ userId }) => {
        // UPDATE DB

        console.log("Player:" + userId + " is searching for a game");
        waiting_players.set(userId, socket);
        await updateGameSearchUser(userId, true);

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
                currentTurn: 'black',
                currentTableWhite: [],
                currentTableBlack: [],
                movesWhite: [],
                movesBlack: [],
                capturedwhite: [],
                capturedBlack: [],
            });
            const data = {
                white_id: p1Id,
                black_id: p2Id,
                roomId: roomId,
                winner: null,
                result: "none",
                moves_white: null,
                moves_black: null,
                start_time: new Date(),
                end_time: new Date(),
                status: "ongoing"
            }
            const id = await registerGame(data);
            if (id) {
                ROOMS.set(roomId, id);
                console.log('game registered');
            } else {
                console.log("game not registered");
            }

            p1socket.emit('game-started', { roomId, opponentId: p2Id, color: 'black', opponent_color: "white", timer: true });
            p2socket.emit('game-started', { roomId, opponentId: p1Id, color: 'white', opponent_color: "black", timer: false });

            // UPDATE DB
            await updateGameSearchUser(p1Id, false);
            await updateGameSearchUser(p2Id, false);
            waiting_players.delete(p1Id);
            waiting_players.delete(p2Id);
        }
    })

    socket.on('stop-find-game', ({ userId }) => {
        if (waiting_players.size < 2) {
            waiting_players.delete(userId);
            console.log(`Player ${userId} stopped searching for game`);
        }
    })
    socket.on("get-table-one-time", ({ roomId, player, table }) => {
        const game = chessGameState.get(roomId);
        if (game.currentTableBlack.length === 0 || game.currentTableWhite.length === 0) {
            if (player === 'white') game.currentTableWhite = table;
            else if (player === 'black') game.currentTableBlack = table;
        }
    })
    socket.on('start-game', async ({ roomId, opponentId, color, opponent_color, timer }) => {
        if (!startGameStatus.has(roomId)) {
            startGameStatus.set(roomId, new Set());
        }


        const started = startGameStatus.get(roomId);
        started.add(socket.id);


        if (started.size === 2) {
            const [socketId1, socketId2] = [...started];


            const socket1 = io.sockets.sockets.get(socketId1);
            const socket2 = io.sockets.sockets.get(socketId2);

            await updatePlayerPlayingState(socket1.userId, true);
            await updatePlayerPlayingState(socket2.userId, true);

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

    socket.on('disconnect', async () => {
        setTimeout(async () => {
            const currentSocket = connectedUsers.get(socket.userId);


            if (!currentSocket || currentSocket.id == socket.id) {
                await updatePlayerActiveState(socket.userId, false);
                for (const [key, value] of chessGameState) {
                    if (value.player1.id === socket.userId || value.player2.id === socket.userId) {
                        const winner = socket.userId === value.player1.id ? value.player1.color :
                            value.player2.color
                        endGame(socket, key, "aborted", winner);
                        break;
                    }
                }
                console.log(`${userId} disconnected entirely with socket ${currentSocket.id}`);

            } else {
                console.log(`${userId} disconnected partially with socket ${socket.id} and reconnected with ${currentSocket.id}`)
            }
        }, 1000)

    });
    socket.on("swapFigures", async ({ roomId, player,from,chosenElement, posToSwap }) => {
        // i need to update postoswap with chosen elelment and thats it 
        console.log(player,chosenElement,posToSwap);
        addMovestoTable(roomId, player, chosenElement, posToSwap,true);
        updateTimer(roomId, player);
        const game = chessGameState.get(roomId);
        const posToSwapFlipped = {...posToSwap,_position:flipIndex(posToSwap._position)};
        // const opponnet_table = player === 'white'?game.currentTableBlack:game.currentTableWhite;
        socket.to(roomId).emit('putFigure', { from:flipIndex(from),chosenElement,posToSwap:posToSwapFlipped,currentTurn: game.currentTurn });
    });

    socket.on('onCheck', ({roomId,player,threat}) => {
        
    })

    socket.on('move', async ({ roomId, move: { player, from, to }, enemy_fig }) => {
        const game = chessGameState.get(roomId);
        const id = ROOMS.get(roomId);
        // add if captured
        addCaptured(roomId, player, enemy_fig);
        // add for displaying panel
        addMovesForDisplayingPanel(roomId, player, from, to);
        // add to table
        addMovestoTable(roomId, player, from, to);
        // add to database
        await addMovesToDatabase(roomId, player, from, to, id);



        if (!checkIfPawnAtEnd(roomId, socket, player, Number(from), Number(to))) {
            console.log("figure not at end");
            updateTimer(roomId, player);
            socket.to(roomId).emit('opponentMove', { from: flipIndex(from), to: flipIndex(to), currentTurn: game.currentTurn });
        }
        socket.to(roomId).emit("get_currentMove", { move: { player, from: positionToAlgebraic(flipIndex(from)), to: positionToAlgebraic(flipIndex(to)) } });
        socket.emit("get_currentMove", { move: { player, from: positionToAlgebraic(from), to: positionToAlgebraic(to) } });
    })

    socket.on('resign', ({ roomId, reason }) => {
        const game = chessGameState.get(roomId);
        if (!game) {
            console.warn("No game found for roomId:", roomId);
            return;
        }

        const winner = game.player1.id === Number(socket.userId)
            ? game.player2.color
            : game.player1.color;

        endGame(roomId, socket, reason, winner);
        socket.to(roomId).emit('game-ended', { reason });
    });

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