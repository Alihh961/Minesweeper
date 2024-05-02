const mongoose = require('mongoose');
const validator = require('validator');


const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: [true, "Name required"],

    } ,
    email: {
        type: String,
        required: [true, "Email required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
        type: String,
        required: [true, "Password required"],
        minlength: [8 , 'Password length: At least 8 letters'],
        select : false
    },
    confirmedPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(val) {
                return val === this.password; // this refers to the document
            },
            message: "Password and confirm password must be equal",
        },

    },

}, {
    toJSON: {virtuals: true}, // this is to get the virtual properties to be displayed in the output
    toObject: {virtuals: true}
});

const userModel = mongoose.model("users", userSchema);


module.exports = userModel;