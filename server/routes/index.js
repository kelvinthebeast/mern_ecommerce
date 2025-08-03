const userRouter = require("../routes/user")
const { errHandler, notFound } = require("../middlewares/errHandler")
const initRoutes = (app) => {
    app.use('/api/user', userRouter)

    app.use(errHandler)
    app.use(notFound)
}

module.exports = initRoutes