const User = require('../models/user')
const asyncHandler = require("express-async-handler")
const {generateAccessToken, generateRefreshToken} = require("../middlewares/jwt")

const register = asyncHandler( async (req, res) => {
    const { email, password, firstname, lastname } = req.body
    if (!email || !password || !firstname || !lastname ) {
        return res.status(400).json({
            success: false,
            mess: "Missing inputs"
        })

    }

    const user = await User.findOne({ email })
    if (user) throw new Error('User has existed!')
    else {

        const newUser = await User.create(req.body)
        return res.status(200).json({
            success: newUser ? true : false,
            mess: newUser ? "Register is successfully. Please go login!" : "Something went wrong"
        })
    }
})  
// refresh token chỉ có chức năng là cấp mới 1 accessToken
// access Token giúp xác thực người dùng, phân quyền người dùng
const login = asyncHandler( async (req, res) => {
    const { email, password } = req.body
    if (!email || !password ) {
        return res.status(400).json({
            success: false,
            mess: "Missing inputs"
        })

    }

    const response = await User.findOne({ email })
    if (response && await response.isCorrectPassword(password)) {
        // tách password và role ra khỏi response
        const {password, role, ...userData} = response.toObject()
        // tạo access token
        const accessToken = await generateAccessToken(response._id, role)
        // tạo refresh token
        const refreshToken = await generateRefreshToken(response._id)
        // lưu refresh token vào database
        await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true })
        // lưu refresh token vào cookies
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7*24*60*60*1000 })
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    } else {
        throw new Error('Invalid credentials')
    }
})  


const getCurrent = asyncHandler( async (req, res) => {
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: false,
        rs: user ? user : "User not found"
    })
})  
module.exports = {
    register,
    login,
    getCurrent
}