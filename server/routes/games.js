const express = require('express');
const router = express.Router();

const { getActiveGamesFunc } = require('../controllers/games.js');


const {body,query} = require('express-validator');
const {validate,requireLogin} = require('../middlewares/validation')
router.use(requireLogin);
router.route("/getActiveGames").get(getActiveGamesFunc);


module.exports = router;


