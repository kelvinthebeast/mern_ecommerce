const nodemailer = require("nodemailer")
const asyncHandler = require("express-async-handler")
const sendMail = asyncHandler( async ({email, html}) => {
    // Create a test account or replace with real credentials.
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
    });

    // Wrap in an async IIFE so we can use await.
    (async () => {
    const info = await transporter.sendMail({
        from: '"Học vụ online" <no-reply@hocvuonline.ueh.com>',
        to: email,
        subject: "[Khẩn cấp]",
        // subject: "Forgot password ✔",

        // text: "Hello world?", // plain‑text body
        html: html, // HTML body
    });

    console.log("Message sent:", info.messageId);
    })();
}
)

module.exports = sendMail