import { getActiveGames ,getGamesForToday} from "../connect/gamesDB.js";



const getActiveGamesFunc = async (req,res) => {
    try{
        const activegames = await getActiveGames();
        res.status(200).json({activegames});
    }catch(error){
        res.status(500).json({error:"Internal server error"});
    }
}


const getGamesForTodayFunc = async (req,res) => {
    try {
        const todayGams = await getGamesForToday();
        console.log(todayGams);
        res.status(200).json({todayGams});

    }catch(error){
        res.status(500).json({error: "Internal error"});
    };
}

export {getActiveGamesFunc,getGamesForTodayFunc }