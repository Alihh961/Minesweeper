const mongoose = require('mongoose');
const validator = require("validator");



const guestSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "Email required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Invalid email format"],
    } ,
    userName : {
        type: String,
        required: [true, "Name required"],
    }

});
