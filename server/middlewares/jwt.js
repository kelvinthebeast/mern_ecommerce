const jwt = require('jsonwebtoken')


const generateAccessToken = async (userId, role) => {
    return jwt.sign({_id: userId, role}, process.env.JWT_SECRET, {expiresIn: '3d'})

}

const generateRefreshToken = async (userId) => {
    return jwt.sign({_id: userId}, process.env.JWT_SECRET, {expiresIn: '7d'})

}


module.exports = {
    generateAccessToken,
    generateRefreshToken
}