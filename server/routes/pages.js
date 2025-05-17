const express = require('express');

const path = require('path');

const projectRoot = path.resolve(__dirname, "..");

const router = express.Router();

router.get('/register', (req,res) => {
    const step = req.query.step;

    if(step === 'skill-level'){
        res.sendFile(path.join(projectRoot, '../client/pages/registerPaths/createSkill-level.html'))
        return;
    }else if (step == "loginInfo"){
        res.sendFile(path.join(projectRoot, '../client/pages/registerPaths/loginInfo.html'))
        return;
    }
    res.sendFile(path.join(projectRoot, '../client/pages/registerPaths/createAccount.html'))
});

// for main page with chessboard 




router.get('/home', (req,res) => {
    console.log(req.session);
    if(!req.session.user)return res.status(401).json({msg: "BAD CREDENTIALS"});
    res.sendFile(path.join(projectRoot, "../client/pages/home.html"));
})

router.get('/home/profile', (req, res) => {
    if(!req.session.user)return res.status(401).json({msg: "BAD CREDENTIALS"});
    res.sendFile(path.join(projectRoot, '../client/pages/profile.html'));
})


module.exports = router;