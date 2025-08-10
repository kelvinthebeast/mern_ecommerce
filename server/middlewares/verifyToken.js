const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const verifyAccessToken = asyncHandler( async (req, res, next) => {
    // headers: { authorization: bearer token }
    if( req?.headers?.authorization?.startsWith("Bearer")) {
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) return res.status(401).json({
                success: false,
                mess: "Invalid access token"
            })
            // console.log(decode);
            req.user = decode

            next()
        })
    } else {
        return res.status(401).json({
            success: false,
            mess: "Require authentication!!!"
        })
    }
} )

const verifyAccessToken2 = asyncHandler( async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        // xác thưc
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decodeInfo) => {
            if (err) return res.status(401).json({
                success: false,
                mess: "Invalid access token"
            })
            console.log(decodeInfo);
            req.user = decodeInfo
            next()
        })
    } else {
        return res.status(401).json({
            success: false,
            mess: "Require authentication!!!"
        })
    }
})
const verifyAccessToken3 = asyncHandler( async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decodeInfo) => {
            if (err) return res.status(401).json({
                success: false,
                mess: "invalid access token"
            })

            req.user = decodeInfo
            next()
        })
    } else {
        return res.status(401).json({
            success: false,
            mess: 'require authentication!!!'
        })
    }
})
module.exports = {
    verifyAccessToken,
    verifyAccessToken2
}