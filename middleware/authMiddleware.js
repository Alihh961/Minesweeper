const jwt = require('jsonwebtoken');
const userModel = require('../models/UserModel');

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;

    if (token) {

        console.log(process.env.APP_SECRET);
        jwt.verify(token, process.env.APP_SECRET, (err, decodedToken) => {

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

        jwt.verify(token, process.env.APP_SECRET, async (err, decodedToken) => {
            if (err) {

                console.log('Error in userIsAuthenticated Middleware')
                res.locals.user = null;

                next();
            } else {

                try {
                    const user = await userModel.findById(decodedToken.id);
                    if (!user) {
                        throw new Error('User not found');
                    }
                    // Pass/inject the user to the view or further middleware
                    res.locals.user = user;
                    next();
                } catch (error) {
                    console.log('Error fetching user:', error);
                    res.locals.user = null;
                    next();
                }

            }
        })
    } else {

        res.locals.user = null;
        next();
    }
};





module.exports = {requireAuth , userIsAuthenticated};