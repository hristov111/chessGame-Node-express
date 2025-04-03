const express = require('express');

const path = require('path');

const projectRoot = path.resolve(__dirname, "..");

const router = express.Router();

router.get('/register', (req, res) => {
    res.sendFile(path.join(projectRoot, '../client/pages/register.html'));
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(projectRoot, '../client/pages/login.html'));

})

router.get('/home', (req,res) => {
    console.log(req.session);
    if(!req.session.user)return res.status(401).json({msg: "BAD CREDENTIALS"});
    res.sendFile(path.join(projectRoot, "../client/pages/main-page.html"));
})

router.get('/home/profile', (req, res) => {
    if(!req.session.user)return res.status(401).json({msg: "BAD CREDENTIALS"});
    res.sendFile(path.join(projectRoot, '../client/pages/profile.html'));
})


module.exports = router;