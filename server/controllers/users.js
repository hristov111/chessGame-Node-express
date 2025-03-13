const { getUsers,getUser,createUser} = require('../connect/database');


const getAllUsersFunc = async (req,res) => {
    try {
        const tasks = await getUsers();
        res.status(200).json({tasks});
    }catch(error){
        res.status(500).json({msg:error});
    }
}

const getUserFunc = async (req,res) => {
    try {
        const {id:taskId} =req.body;
        const task = await getUser(taskId);
        if(!task)return res.status(404).json({msg:`No task with id: ${taskId}`});
        res.status(200).json({task})
    }catch(error){
        res.status(500).json({msg:error});
    }
   
}

const createUserFunc = async (req,res) => {
    try{
        // const task = await createUser(req.body);
        console.log(req.body);
        res.status(201).send('success');
    }catch(error){
        res.status(500).json({msg:error});
    }       

}

module.exports = {
    getAllUsersFunc,getUserFunc,createUserFunc
}


