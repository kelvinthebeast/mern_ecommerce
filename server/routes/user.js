const router = require('express').Router()

const controller = require("../controllers/user")
const { verifyAccessToken } = require('../middlewares/verifyToken')
router.post('/login', controller.login)
router.post('/register', controller.register)
router.get("/current", verifyAccessToken, controller.getCurrent)
router.post("/refreshToken", controller.refreshAccessToken)

module.exports = router