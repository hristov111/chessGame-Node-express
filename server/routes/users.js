const express = require("express");
const router = express.Router();
const {
  getAllUsersFunc,
  logOutFunc,
  getUserByIdFunc,
  restoreGuestFunc,
  usernameExistsFunc,
  getUserByUsernameFunc,
  createUserFunc,
  updatePlayerActiveStateFunc,
  createGuestUserFunc,
  updateGameSearchState,
  getGameSearchingUsers,
  updateAllActiveStateFunc,
  getallActiveUsersFunc,
  getAllUnactiveUsersFunc,
  getUserByCharFunc,
  updatePasswordFunc,
  getEverythingForUser,
  getSession,
  updateProfileFunc,
} = require("../controllers/users.js");

const { body, query } = require("express-validator");
const { validate, requireLogin } = require("../middlewares/validation");

//usr,username,firstname,lastname,email,biography
router.route("/register").post(createUserFunc);
router.route("/login").post(getUserByUsernameFunc);
router
  .route("/existsUsername")
  .get(
    [
      query("guest_username")
        .notEmpty()
        .withMessage("Specify the username to check!"),
      validate,
    ],
    usernameExistsFunc
  );
router.route("/createGuest").post(createGuestUserFunc);
router.route("/restore-guest").post(restoreGuestFunc);
router.use(requireLogin);
router.route("/logout").post(logOutFunc);
// router.route("/:id").get(getUserByIdFunc)
router.route("/verifypassword").post(
  [
    body("usr").notEmpty().withMessage("Specify a user"),
    body("oldPassword").notEmpty().withMessage("Password required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be between 8 and 20 chars")
      .matches(/[a-z]/)
      .withMessage("Must containt at least one lower case char")
      .matches(/[A-Z]/)
      .withMessage("Must contain at least one upper case char")
      .matches(/[0-9]/)
      .withMessage("Must contain at least one number")
      .matches(/[!_@#$%^&*(),.?":{}|<>]/)
      .withMessage("Must contain at lease one special symbol"),
    validate,
  ],
  updatePasswordFunc
);
router.route("/updateprofile").patch(
  [
    body("id").notEmpty().withMessage("User ID is required"),

    body("username")
      .optional()
      .isLength({ min: 4, max: 9 })
      .withMessage("Username must be 4-9 characters")
      .custom((value) => {
        const digitCount = (value.match(/\d/g) || []).length;
        if (digitCount < 2)
          throw new Error("Username must contain at least 2 numbers");
        return true; // important!
      }),

    body("firstname")
      .optional()
      .isLength({ max: 20 })
      .withMessage("First name must be 20 characters or less")
      .matches(/^[A-Za-z]+$/)
      .withMessage("First name must contain only letters"),

    body("lastname")
      .optional()
      .isLength({ max: 20 })
      .withMessage("Last name must be 20 characters or less")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Last name must contain only letters"),

    body("email").optional().isEmail().withMessage("Email is not valid"),

    body("biography")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Biography must be 50 characters or less"),

    validate,
  ],
  updateProfileFunc
);

router.route("/players").get(getAllUsersFunc);
router.route("/me").get(getSession);
router.route("/allActive").get(getallActiveUsersFunc);
router.route("/active").get(getUserByCharFunc);
router.route("/allUnactive").get(getAllUnactiveUsersFunc);
router
  .route("/updateplayerActiveState")
  .patch(
    [
      query("name")
        .notEmpty()
        .withMessage("No user specified")
        .isString()
        .withMessage("Name must be a string"),

      query("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["true", "false"])
        .withMessage("Status is not valid"),

      validate,
    ],
    updatePlayerActiveStateFunc
  );
router.route("/updateGameSearchState").patch(updateGameSearchState);
router.route("/updateplayers").patch(updateAllActiveStateFunc);
router.route("/get-searchingUsers/:id").get(getGameSearchingUsers);
router.route("/by-id/:id").get(getUserByIdFunc);

module.exports = router;
