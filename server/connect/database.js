import mysql from "mysql2";
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE
}).promise();

async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows
}

async function getUserById(id){
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0];
}



const getUserByUsername = async (username) => {
    const [rows]= await pool.query(`SELECT * FROM users WHERE username = ?`, [username]);
    return rows[0];
}
async function createUser(username, password_hash){
    const [res]= await pool.query(`
        INSERT INTO users (username,password_hash) VALUES (? ,?)`, [username, password_hash]);
    const id =  res.insertId;
    return id;
}

const updatePlayerActiveState = async (username, state) => {
    const [rows] = await pool.query("UPDATE users SET is_online = ? WHERE username = ?", [state,username]);
    return rows;
}

const updatePassword = async(username, password_hash) => {
    const [rows] = await pool.query("UPDATE users SET password_hash = ? WHERE username = ?",[password_hash,username]);
    return rows;
}

const updateAllActiveState = async (state) => {
    const [rows] = await pool.query("UPDATE users SET is_online = ?", [state]);
    return rows;
}

const getAllActiveUsers = async () => {
    const [rows] = await pool.query("SELECT * FROM users WHERE is_online = true");
    return rows; 
}

const getAllUnactiveUsers = async() => {
    const [rows] = await pool.query("SELECT * FROM users WHERE is_online = false");
    return [rows];
}

const getUsersByChar = async(char) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE username LIKE ?", [`${char}%`]);
    return rows;
}

export {getUsers,getUserById,getUserByUsername,createUser,updatePlayerActiveState,updateAllActiveState, getAllActiveUsers, getAllUnactiveUsers,getUsersByChar,
    updatePassword
}


// notes


// 1. route params 
// ex. app.get("/api/users/:id", (request,res) => {
//  console.log(request.params) => {id: number} 
//})

// 2. query params localhost:5500/products?key=value&key2=values2 - query string
// ex. app.get("/api/users", (request,res) => {
//  console.log(request.query) => {id: number} 
//})

// 3. POST request
// app.post("/api/users", (request, res) => {console.log(request.body)})


//4. Put request - you are updatring the entire record
// app.put("/api/users/:id", (req,res) => const {body, params: {id}} = request)
// in the body is the new data taht we want to update the old one 


// 5. PATCH request - updates a record partially , instead of everything 
// app.patch("/api/users/:id", (req,res) =>  const {body, params: {id}} = request)

//6. DELETE request - delets a record 
// app.delete("/api/users/:id", (req,res) => { const {params: {id}} = req})


// validation
// 