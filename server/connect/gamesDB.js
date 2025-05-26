import pool from "./db.js";


const getActiveGames = async () =>{
    const rows = await pool.query("SELECT COUNT(id) AS count FROM games WHERE status = 'ongoing'");
    return rows[0].count;
}

const getGamesForToday = async() => {
    const rows = await pool.query("SELECT COUNT(id) AS count FROM games WHERE start_time >= NOW() - INTERVAL 1 DAY");
    return rows[0].count;
}


const registerGame = async (data) => {
    const query = `
        INSERT INTO games (
            white_player_id,
            black_player_id,
            roomId,
            winner,
            result,
            moves_white,
            moves_black,
            start_time,
            end_time,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.white_id,
        data.black_id,
        data.roomId,      
        data.winner,
        data.result,
        data.moves_white,
        data.moves_black,
        data.start_time,
        data.end_time,
        data.status
    ];

    const [result] = await pool.query(query, values);
    return result.insertId;
};

const updateMoves = async (id, moves_white, moves_black) => {
    const [rows] = await pool.query(
        `
        UPDATE games 
        SET 
            moves_white = CONCAT(IFNULL(moves_white, ''), ', ', ?),
            moves_black = CONCAT(IFNULL(moves_black, ''), ', ', ?)
        WHERE id = ?
        `,
        [moves_white, moves_black, id]
    );
    return rows;
};

const updateStatus = async(id,status) =>{
    const [rows] = await pool.query("UPDATE games SET status = ? WHERE id = ?", [status,id]);
    return rows;
}

const updateEndTime = async(id,endTime) => {
    const [rows] = await pool.query("UPDATE games SET end_time = ? WHERE id = ?", [endTime,id]);
    return rows;
}


const updateWinner = async(id, winner) => {
    const [rows] = await pool.query("UPDATE games SET winner = ? WHERE id = ?", [winner,id]);
    return rows;
}
export {getActiveGames,updateWinner,getGamesForToday,registerGame,updateMoves,updateStatus,updateEndTime};


