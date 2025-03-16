const { getUsers,getUserById,getUserByUsername,createUser} = require('../connect/database');
const bcrypt = require('bcrypt');

const hashPassword = async (password) =>{
    return await bcrypt.hash(password, 10);
}

const verifyPassword = async(enteredPassword, storedHash) => {
    return await bcrypt.compare(enteredPassword, storedHash);
}


const getAllUsersFunc = async (req,res) => {
    try {
        const tasks = await getUsers();
        res.status(200).json({tasks});
    }catch(error){
        res.status(500).json({msg:error});
    }
}

const getUserByIdFunc = async (req,res) => {
    try {
        const {id:taskId} =req.body;
        const task = await getUserById(taskId);
        if(!task)return res.status(404).json({msg:`No task with id: ${taskId}`});
        res.status(200).json({task})
    }catch(error){
        res.status(500).json({msg:error});
    }
   
}

const getUserByUsernameFunc = async (req,res) => {
    try {
        const {username,password} = req.body;
        const user = await getUserByUsername(username);
        console.log(user);
        if(user.length == 0) return res.status(404).json({msg:`There isn't a person with this username: ${username}`});
        res.status(200).json({username});
    }catch(error){
        res.status(500).json({msg:error});
    }
}

const createUserFunc = async (req,res) => {
    try{
       const {username,password} = req.body;
       const user = await getUserByUsername(username);
       console.log(username,password, user);
       // check if user exists
       if(user.length == 0){
        // if we are here this means we didnt find any user with this username so everything is okay
        // firstly we need to hash the password given
        const password_hash = await hashPassword(password);
        const id = await createUser(username,password_hash);
        return res.status(201).json({username,password});
       }
       res.status(409).json({msg:`The username is already in use: ${username}`});
    }catch(error){
        res.status(500).json({msg:error});
    }       

}

module.exports = {
    getAllUsersFunc,getUserByIdFunc,getUserByUsernameFunc,createUserFunc
}


