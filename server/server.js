const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const users = require("./routes/users");
const pages = require("./routes/pages");
//middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('/',users);
app.use('/', pages);

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