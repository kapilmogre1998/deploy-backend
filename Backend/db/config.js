const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()

function connectDB() {
    const dbURI = process.env.MONGO_URI;
    mongoose.connect(dbURI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));
}

module.exports = connectDB;