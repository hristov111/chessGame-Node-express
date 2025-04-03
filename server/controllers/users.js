const { getUsers,getUserById,getUserByUsername,createUser
    ,updatePlayerActiveState,
    updateAllActiveState,getAllActiveUsers,getAllUnactiveUsers,getUsersByChar,updatePassword
} = require('../connect/database');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => await bcrypt.hash(password, 10);


const verifyPassword = async(enteredPassword, storedHash) => await bcrypt.compare(enteredPassword, storedHash);

const getAllUsersFunc = async (req,res) => {
    const users= await getUsers();
    const names = users.map(el => {
        return {
            username:el.username,
            games:el.total_games,
            wins:el.total_wins,
            losses:el.total_losses,
            online:el.is_online
        }   
    });
    res.status(200).json(names);
}

const getSession = async (req,res) => {
    if(!req.session.user){
        console.log("unauthorized");
        return res.status(401).json({msg: "Unauthorized"});
    }
    res.json({username: req.session.user});
}

const setPassword = async (req,res) => {
    try{
        const {username, password,newPassword} = req.body;
        const user = await getUserByUsername(username);
        if(user == undefined)return res.status(404);
        if(await verifyPassword(password,user.password_hash)){
            const newpass_hash = hashPassword(newPassword);
            const result2 = await updatePassword(username,newpass_hash);
            // now here i need to update password
            return res.status(200).json({msg:"success"});
        }else return res.status(401);
    }catch(error){
        res.status(500);
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
        if(user == undefined) return res.status(404).json({msg:`There isn't a person with this username: ${username}`});
        if( await verifyPassword(password,user.password_hash)){
            req.session.user = username;
            return res.status(200).json({user});
        }else {
            return res.status(401).json({msg:'Wrong password!'});   
        }
    }catch(error){
        res.status(500).json({msg:error});
    }
}

const createUserFunc = async (req,res) => {
    try{
       const {username,password} = req.body;
       const user = await getUserByUsername(username);
       // check if user exists
       if(user == undefined){
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

const updatePlayerActiveStateFunc = async (req,res) => {
    const name = req.query.name;
    const status = req.query.status;
    const result = await updatePlayerActiveState(name,status);
    res.status(200).json({result});
}

const updateAllActiveStateFunc = async (req,res) => {
    const status = req.query.status;
    const result = updateAllActiveState(status);
}

const getallActiveUsersFunc = async (req,res) => {
    const users= await getAllActiveUsers();
    const names = users.map(el => {
        return {
            username:el.username,
            games:el.total_games,
            wins:el.total_wins,
            losses:el.total_losses
        }   
    });
    res.status(200).json(names);
}
const getAllUnactiveUsersFunc = async(req,res) => {
    const result = await getAllUnactiveUsers();
    res.status(200).json(result);
}

const getUserByCharFunc = async(req,res) =>{
    const {char}= req.query
    const users = await getUsersByChar(char);
    if(users.length== 0) return;
    const names = users.map(el => {
        return {
            username:el.username,
            games:el.total_games,
            wins:el.total_wins,
            losses:el.total_losses,
            online:el.is_online
        }
    })
    res.status(200).json(names);
}
//username       | password_hash    | is_online | total_games | total_wins | total_losses | firstname | lastname | email | biography | profile_picture
const getEverythingForUser = async(req,res) => {
    const {user} = req.params;
    const {password_hash,...others} = await getUserByUsername(user);
    if(password_hash == undefined) return res.status(404);
    else {
        return res.status(201).json({others});
    }

}


module.exports = {
    getAllUsersFunc,getUserByIdFunc,getUserByUsernameFunc,createUserFunc,
    updatePlayerActiveStateFunc,
    updateAllActiveStateFunc,getallActiveUsersFunc,getAllUnactiveUsersFunc,getUserByCharFunc,setPassword
    ,getSession,getEverythingForUser
}


