const jwt = require('jsonwebtoken');
const userModel = require('../models/UserModel');

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt || req.cookies.jwtG;
    if (token) {

        jwt.verify(token, process.env.APP_SECRET, (err, decodedToken) => {

            if (err) {

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

    // Guest token
    const tokenGuest = req.cookies.jwtG;


    if (token || tokenGuest) {

        if (token) {
            jwt.verify(token, process.env.APP_SECRET, async (err, decodedToken) => {
                if (err) {

                    console.log('Error in userIsAuthenticated Middleware');
                    res.cookie('jwt', '1' , {maxAge : 1});
                    res.cookie('jwtG', '1' , {maxAge : 1});
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

            jwt.verify(tokenGuest, process.env.APP_SECRET, async (err, decodedToken) => {
                if (err) {

                    console.log('Error in userIsAuthenticated Middleware (Token Guest)')
                    res.locals.user = null;
                    res.cookie('jwt', '1' , {maxAge : 1});
                    res.cookie('jwtG', '1' , {maxAge : 1});

                    next();
                } else {

                const user = {id :decodedToken.id , userName :decodedToken.userName};

                res.locals.user = user;

                next();


                }
            })

        }


    } else {

        res.locals.user = null;
        next();
    }
};


module.exports = {requireAuth, userIsAuthenticated};