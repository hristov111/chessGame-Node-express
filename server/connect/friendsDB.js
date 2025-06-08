import pool from "./db.js";

const getFriendsById = async (id) => {
    const res =
        await pool.query(`SELECT 
        u1.id AS id1,u2.id AS id2 FROM friends AS f
        JOIN users u1 ON f.friend1_id = u1.id
        JOIN users u2 ON f.friend2_id = u2.id
        WHERE f.friend1_id = ? OR f.friend2_id = ?;`
            , [id, id]);
    return res[0];
}

const deleteFriendsById = async (myId, friendId) => {
    const res = await pool.query(`
            DELETE FROM friends 
            WHERE (friend1_id = ? AND friend2_id = ?) 
               OR (friend1_id = ? AND friend2_id = ?)
        `, [myId, friendId, friendId, myId]);
    return res[0].affectedRows > 0;
}

const checkIfSomeoneIsFriend = async (myId,id) => {
    const res = await pool.query(`
        SELECT COUNT(id) FROM friends 
        WHERE (friend1_id = ? AND friend2_id = ?) OR (friend1_id = ? AND friend2_id = ?)
        `, [myId,id,id,myId])
    return res[0][0].count > 0;
}

export { getFriendsById ,deleteFriendsById,checkIfSomeoneIsFriend};