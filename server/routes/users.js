const express = require('express');
const router = express.Router();
const {getAllUsersFunc,getUserByIdFunc,getUserByUsernameFunc,createUserFunc,
    updatePlayerActiveStateFunc,
    updateAllActiveStateFunc,getallActiveUsersFunc,getAllUnactiveUsersFunc,getUserByCharFunc,setPassword,getEverythingForUser
,getSession} = require('../controllers/users');

router.route('/register').post(createUserFunc);
router.route('/login').post(getUserByUsernameFunc); 
router.route("/verifypassword").post(setPassword);


router.route("/players").get(getAllUsersFunc);
router.route("/me").get(getSession);
router.route("/allActive").get(getallActiveUsersFunc);
router.route("/active").get(getUserByCharFunc);
router.route("/allUnactive").get(getAllUnactiveUsersFunc);
router.route("/updateplayer").patch(updatePlayerActiveStateFunc);
router.route("/updateplayers").patch(updateAllActiveStateFunc);
router.route("/:user").get(getEverythingForUser);


module.exports = router;