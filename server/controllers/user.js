const User = require('../models/user')
const asyncHandler = require("express-async-handler")
const {generateAccessToken, generateRefreshToken} = require("../middlewares/jwt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const crypto = require('crypto')
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

const refreshAccessToken = asyncHandler( async (req, res) => {
    // lấy token từ cookies 
    const cookie = req.cookies
    // check xem có token hay không
    if (!cookie && !cookie.refreshToken) throw new Error("No refresh token in cookies!")
    // const refreshToken = cookie.refreshToken;
    // check trong cookie mã refreshToken có hợp lệ 
    const rs = jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({ _id: rs._id, refreshToken: cookie.refreshToken})
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? await generateAccessToken(response._id, response.role) : "Refresh Token not matched"
    })
})

const logout = asyncHandler( async(req, res) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken) throw new Error("No refresh token in cookies")
    // xóa refresh token ở db 
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken}, {refreshToken: ""}, {new: true})   
    // xóa refresh token ở cookies luôn
    res.clearCookie("refreshToken", { httpOnly: true, secure: true }) 
    return res.status(200).json({
        success: true,
        mess: "Logout is done!"
    })
})

// client gửi mail
// server check xem email có hợp lệ không -> gửi mail + kèm theo link  (password change token)
// client check mail -> click link
// client gửi api kèm token
// check token có giống với token mà gửi server gửi mail không
// change password
const forgotPassword = asyncHandler( async (req, res) => {
    const { email } = req.query
    if (email) {
        const user = await User.findOne({email});
        if (!user) throw new Error("User is not found") 
        const resetToken = await user.createPasswordChangeToken()
        console.log("Raw reset token:", resetToken)
        await user.save() // lưu token trong db
        // gửi mail
        // const html = `xin vui lòng click vào link bên dưới để thay đổi mật khẩu của bạn. Link này sẽ hết hạn sau 15p kể từ bây giờ. 
        // <a href=${process.env.URL_SERVER}/api/user/resetpassword/${resetToken}>Click here</a>`
        const html = `<p><b>[THÔNG BÁO HỌC VỤ]</b></p>

                <p>Kính gửi <b>Lý Vũ Trọng Nhân</b>,</p>

                <p>Hệ thống quản lý đào tạo vừa hoàn tất cập nhật điểm kỳ vừa qua. 
                Theo kết quả đối chiếu, bạn <b>không đạt</b> yêu cầu ở các học phần sau:</p>

                <ul>
                <li>Kinh tế vi mô (0.5/10)</li>
                <li>Nguyên lý kế toán (1.0/10)</li>
                <li>Kỹ năng mềm (vắng 80% số buổi)</li>
                </ul>

                <p>Theo quy chế học vụ, bạn sẽ <b>bị cảnh cáo học tập</b> và <b>có nguy cơ tạm ngừng học</b> nếu tiếp tục vi phạm ở học kỳ tiếp theo.</p>

                <p>Vui lòng truy cập cổng thông tin sinh viên để xem chi tiết và thực hiện các thủ tục bắt buộc trước <b>17h00 ngày 20/08/2025</b>.</p>

                <p><a href="https://sv.hotromonhoc.ueh.com/login">Truy cập ngay</a></p>
                <a href=${process.env.URL_SERVER}/api/user/resetpassword/${resetToken}>Click here</a>

                <p><i>Đây là email tự động, vui lòng không trả lời.</i></p>
`

        const data = {
            email,
            html
        }

        const rs = await sendMail(data)
        return res.status(200).json({
            success: true,
            rs
        })
    } else {
        throw new Error("Missing email!")
    }
})

const resetPassword = asyncHandler (async (req, res) => {
    const { password, token } = req.body
    console.log("Password: ", password);
    console.log("Token: ", token)
    if (!password || !token) throw new Error("Missing inputs")
    const passwordResetToken = crypto.createHash("sha256").update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetExpires: {$gt: Date.now()} })

    if (!user) throw new Error("Invalid token")
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangedAt = Date.now()
    user.passwordResetExpires = undefined
    await user.save()
    res.status(200).json({
        success: user ? true : false,
        mess: user ? "Updated password" : "Something went wrong!"
    }) 
})
// htfh swwv acbx nrrd
// htfh swwv acbx nrrd
module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword
}