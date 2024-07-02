const jwt = require('jsonwebtoken');
const userModel = require('../models/UserModel');

const handleJwt = async (jwtToken) => {
    try {
        const decodedToken = jwt.verify(jwtToken, process.env.APP_SECRET);
        const user = await userModel.findById(decodedToken.id);

        return {user , status: true};
    } catch (err) {
        console.error('Error handling JWT:', err);
        return {user : null , status : false};
    }
}

module.exports = {handleJwt};
