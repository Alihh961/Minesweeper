const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName:
    String

}, {
    toJSON: {virtuals: true}, // this is to get the virtual properties to be displayed in the output
    toObject: {virtuals: true}
});

const userModel = mongoose.model("users", userSchema);


module.exports = userModel;