const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const users = require("./routes/users");
const pages = require("./routes/pages");
const games = require("./routes/games");
const session = require('express-session');
const PORT = process.env.PORT || 5500;

const {Server} = require('socket.io');
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
        maxAge: 30 * 60 * 1000, // 30 minutes
        httpOnly: true,         // protect from client-side JS
        secure: false           // set to true if using HTTPS
    }
}));

io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id);


    socket.on('joinGame', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined game room ${roomId}`);
    })
    socket.on('move', ({roomId,from,toString,promotion}) => {
        socket.to(roomId).emit('opponentMove', {from,to,promotion});
    })

    socket.on('disconnect', () => {
        console.log("Socket disconnected", socket.id);
    })
})


app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('/api/users',users);
app.use('/api/games',games);
app.use('/', pages);

app.get("*", (req,res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
})
httpServer.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
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