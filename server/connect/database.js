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

async function getUser(id){
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0];
}
async function createUser(title, content){
    const [res]= await pool.query(`
        INSERT INTO users (username,password_hash) VALUES (? ?)`, [title, content]);
    const id =  res.insertId;
    return getNote(id);
}


export {getUsers,getUser,createUser}