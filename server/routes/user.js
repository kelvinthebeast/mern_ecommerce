const router = require('express').Router()
const {verifyAccessToken, isAdmin} = require("../middlewares/verifyToken")
const controller = require("../controllers/user")
router.post('/login', controller.login)
router.post('/register', controller.register)
router.get("/current", verifyAccessToken, controller.getCurrent)
router.post("/refreshToken", controller.refreshAccessToken)
router.get("/logout", controller.logout)
router.get("/forgotpassword", controller.forgotPassword)
router.put("/resetpassword", controller.resetPassword)

router.get("/", [verifyAccessToken, isAdmin], controller.getUsers)
module.exports = router

// Create (post) + PUT -> body
// get + delete -> query ?element&