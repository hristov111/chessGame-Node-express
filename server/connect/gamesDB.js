import pool from "./db.js";


const getActiveGames = async () =>{
    const rows = pool.query("SELECT COUNT(id) AS count FROM games WHERE status = 'ongoing'");
    return rows[0].count;
}

const getGamesForToday = async() => {
    const rows = pool.query("SELECT COUNT(id) AS count FROM games WHERE start_time >= NOW() - INTERVAL 1 DAY");
    return rows[0].count;
}


export {getActiveGames,getGamesForToday};


