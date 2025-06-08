const express = require('express');
const router = express.Router();

const {getFriendsByIdController,deleteFriendsByIdController} = require('../controllers/friends.js');

const {body,query} = require('express-validator');
const {validate,requireLogin} = require('../middlewares/validation')
// router.use(requireLogin);
router.route('/getFriendsById/:id').get(getFriendsByIdController);
router.route('/deleteFriendById').delete(deleteFriendsByIdController);
module.exports = router;