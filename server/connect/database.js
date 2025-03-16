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
    return rows;
}
async function createUser(username, password_hash){
    const [res]= await pool.query(`
        INSERT INTO users (username,password_hash) VALUES (? ,?)`, [username, password_hash]);
    const id =  res.insertId;
    return id;
}


export {getUsers,getUserById,getUserByUsername,createUser}