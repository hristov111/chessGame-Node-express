import pool from "./db.js";
async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows
}

async function getUserById(id){
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0];
}

const getUserByEmail = async (email) => {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0];
}

const getUserByUsername = async (username) => {
    const [rows]= await pool.query(`SELECT * FROM users WHERE username = ?`, [username]);
    return rows[0];
}

const getAdminStatus = async (username) => {
    const [rows] = await pool.query(`SELECT isAdmin FROM users WHERE username = ?`, [username]);
    return rows[0];
}
async function createUser(username, password_hash){
    const [res]= await pool.query(`
        INSERT INTO users (username,password_hash) VALUES (? ,?)`, [username, password_hash]);
    const id =  res.insertId;
    return id;
}

const createGuestUser = async (guest_name) => {
    const [res]  = await pool.query(`INSERT INTO users (username,password_hash,is_guest) VALUES (?,?, ?)`, [guest_name,'guest1543',true])
    const id = res.insertId;
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

const updateUser = async (username, fields) => {
    const keys = Object.keys( fields);
    const values = Object.values( fields);

    const setClause = keys.map(key => `${key} = ?`).join(",");

    const [rows] = await pool.query(
        `UPDATE users SET ${setClause} WHERE username = ?`, [...values,username]
    );
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
    updatePassword,updateUser,getAdminStatus,getUserByEmail,createGuestUser
}
