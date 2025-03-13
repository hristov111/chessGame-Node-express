const express = require('express');
const router = express.Router();
const {getAllUsersFunc,getUserFunc,createUserFunc} = require('../controllers/users');

router.route('/register').post(createUserFunc);
router.route('/login').get(getUserFunc); 

module.exports = router;