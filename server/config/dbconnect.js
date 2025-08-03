const mongoose = require('mongoose');
const dbConnect = async () => {


    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        if (conn.connection.readyState === 1) console.log("Connected successfully");
        else console.log("Connect failed!!");
        
        
    } catch (error) {
        console.log("Mongoose connected failed!!");
        throw new Error(error)
        
    }
}

module.exports = dbConnect