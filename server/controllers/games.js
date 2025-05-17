import { getActiveGames } from "../connect/gamesDB.js";



const getActiveGamesFunc = async (req,res) => {
    try{
        const activegames = await getActiveGames();
        res.status(200).json({activegames});
    }catch(error){
        res.status(500).json({error:"Internal server error"});
    }
}

export {getActiveGamesFunc}