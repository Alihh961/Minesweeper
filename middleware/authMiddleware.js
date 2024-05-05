const jwt = require('jsonwebtoken');
const userModel = require('../models/UserModel');

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    if (token) {

        jwt.verify(token, process.env.SECRET_STR, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/');

            } else {
                next();

            }
        })
    } else {

        res.redirect('/');
    }
};


// check if there is a valid token then login the user
const userIsAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {

        jwt.verify(token, process.env.SECRET_STR, async (err, decodedToken) => {
            if (err) {
                // pass/inject the user to the view

                console.log('err in userIsAuthenticated Middleware')
                res.locals.user = null;

                next();
            } else {


                let user = await userModel.findById(decodedToken.id);

                // pass/inject the user to the view
                res.locals.user = user;
                next();

            }
        })
    } else {

        res.locals.user = null;
        next();
    }
};





module.exports = {requireAuth , userIsAuthenticated};