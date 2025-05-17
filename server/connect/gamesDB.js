import pool from "./db.js";


const getActiveGames = async () =>{
    const rows = pool.query("SELECT COUNT(id) AS count FROM games WHERE status = 'ongoing'");
    return rows[0].count;
}


export {getActiveGames};


