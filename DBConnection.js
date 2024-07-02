const mongoose = require("mongoose");

const dbURI = `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_USERNAME_PASSWORD}@${process.env.CLUSTER_NAME}.xbrqs2r.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority&appName=Work`;
const connectToDB = async () => {

    try {
        const result = await mongoose.connect(dbURI);
        console.log("Connected Successfully to the database");
        return result;
    } catch (err) {
        console.error("Database connection error:", err);
        throw err; // re-throw the error after logging it
    }
};


module.exports = connectToDB

