// require('dotenv').config();

const mongoose = require('mongoose');
const mongUrl = process.env.MONGO_URL;

const connectToMongo = async () => {
    mongoose.connect(mongUrl, () => { console.log("Connection established to MongoDB successfully") });
};

module.exports = connectToMongo;
