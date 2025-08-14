const router = require('express').Router()

const controller = require("../controllers/user")
const { verifyAccessToken } = require('../middlewares/verifyToken')
router.post('/login', controller.login)
router.post('/register', controller.register)
router.get("/current", verifyAccessToken, controller.getCurrent)
router.post("/refreshToken", controller.refreshAccessToken)
router.get("/logout", controller.logout)
router.get("/forgotpassword", controller.forgotPassword)
router.put("/resetpassword", controller.resetPassword)
module.exports = router

// Create (post) + PUT -> body
// get + delete -> query ?element&