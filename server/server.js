const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const users = require("./routes/users");
const pages = require("./routes/pages");
const session = require('express-session');

const PORT = process.env.PORT || 5500;

const {query} = require('express-validator');
//middleware
app.use(session({
    secret:'kalata the dev',
    saveUninitialized:false, // save session object in the server
    resave:false,
    cookie: {
        maxAge: 60000 * 60,// messuared in millisseconds
          
    },
}))

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use('/', pages);
app.use('/api/users',users);
app.listen(PORT, () =>{
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