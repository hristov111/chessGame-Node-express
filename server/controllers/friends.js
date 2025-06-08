import { getFriendsById,deleteFriendsById,checkIfSomeoneIsFriend } from "../connect/friendsDB.js";



const getFriendsByIdController = async (req,res) => {
    try{
        const id = req.params.id;
        if(!id) return res.status(404).json({msg: "No id passed"});
        const rows =await getFriendsById(id);
        console.log(rows);
        return res.status(200).json(rows);        
    }catch(error){
        console.error("Error in getFriendsByIdController: ",error);
        return res.status(500).json({msg:"Internal server error"});

    }
}

const deleteFriendsByIdController = async (req,res) =>{
    try {
        const myId = req.query.myId;
        const friendId = req.query.friendId;
        if(!myId || !friendId)return res.status(404).json({msg: "Please enter the right values"});
        const rows = await deleteFriendsById(myId,friendId);
        return res.status(200).json(rows);
    }catch(error){
        console.error("Error in deleteFriendsByIdController: ",error);
        return res.status(500).json({msg: "Internal server error"});
    }
}

const checkIfSomeoneIsFriendContorller = async(req,res) => {
    try {
    
    }catch(error){

    }
}

export {getFriendsByIdController,deleteFriendsByIdController};


