const express = require('express');
const router = express.Router();
const {getAllUsersFunc,getUserByIdFunc,getUserByUsernameFunc,createUserFunc} = require('../controllers/users');

router.route('/register').post(createUserFunc);
router.route('/login').post(getUserByUsernameFunc); 

module.exports = router;