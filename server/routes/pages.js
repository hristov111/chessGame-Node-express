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

module.exports = router;