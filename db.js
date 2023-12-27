require('dotenv').config();

const mongoose = require('mongoose');
const mongUrl = process.env.MONGO_URL;

const connectToMongo = async () => {
    mongoose.connect(mongUrl, () => { console.log("Connection established to MongoDB successfully") });
};

module.exports = connectToMongo;

// even if you delete the db from local system, running thunderclient will create same db again and enter the new data into it