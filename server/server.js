const express = require('express');
const app = express();
const cors = require('cors');
const users = require("./routes/users");
//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('chessGame/client/pages',users);

app.listen(5500, () =>{
    console.log('Server is running on port 5500');
})



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