const express = require('express');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid')
const userModel = require('../models/UserModel');

const maxAge = 30 * 24 * 60 * 60;

const signup = async (req, res, next) => {

    const userName = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;


    const saveBoolean = req.body.save;


    try {
        const usernameExists = await userModel.findOne({userName: userName});

        if (usernameExists) {

            throw {message: 'Username already exists', statusCode: 409};

        }
        const emailExists = await userModel.findOne({email: email});

        if (emailExists) {

            throw {message: 'Email already exists', statusCode: 409};


        }
        if (password !== confirmedPassword) {
            throw {message: "Passwords don't match", statusCode: 400};

        }
        if (password.length < 8) {
            throw {message: "Password Error: 8 letters at least", statusCode: 400};

        }
        const newUser = new userModel({
            userName,
            email,
            password,
            confirmedPassword
        });
        await newUser.save();

        res.status(201).json({message: "Username added successfully", status: 201});

    } catch (error) {

        return res.json({message: error.message, code: error.statusCode});
    }


};

const login = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;


    try {
        var user = await userModel.findOne({email}).select('+password');


        if (!email || !password) {
            throw ({message: 'Please provide an email and password!', statusCode: 400});

        }


        if (!user || !await user.comparingPasswordInDB(password, user.password)) {
            throw ({message: 'Invalid credentials', statusCode: 401});

        }


        // to deselect the password
        user = await userModel.findOne({email});

        const token = signToken(user._id , user.userName);

        // httpOnly (true) means that the user can't access the cookie from the browser like the console
        res.cookie('jwt', token, {httpOnly: false, maxAge: maxAge * 1000}) // * 1000 because in the cookie it is treated in milliseconds

        // res.redirect('/lobby');
        return res.status(200).json({
            status: 'success',
            statusCode: 200,
            userId: user._id,
            userName: user.userName
        });


    } catch (error) {

        return res.json({message: error.message, statusCode: error.statusCode});

    }


};

const logout = (req, res) => {

    res.cookie('jwt', '', {maxAge: 1});
    res.cookie('jwtG', '', {maxAge: 1});

    res.redirect('/');
};

const createRandomGuest = async (req, res, next) => {


    try{
        let userName = '';
        let id = uuidv4();


        userName = generateRandomUserName();


        const jwt = signToken(id , userName);

        const user = {id, userName , jwt};

        // httpOnly (true) means that the user can't access the cookie from the browser like the console
        res.cookie('jwtG', jwt, {httpOnly: false, maxAge: maxAge * 1000});
        res.locals.user = user;

        return res.status(200).json({
            status: 'success',
            statusCode: 200,
            userId: user.id,
            userName: user.userName
        });
    }
    catch(err){
        console.log({Error : err});
    }


}

const signToken = function (id , userName) {
    return jwt.sign(
        {_id : id , userName} /* payload*/,
        process.env.APP_SECRET /* secret string */,
        {
            expiresIn: maxAge /* expire date */,
        }
    );
};

function generateRandomUserName() {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let userName = '';


    for (let i = 0; i < 5; i++) {
        userName += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    userName = `Guest-${userName}`;

    return userName;
}



module.exports = {signup, login, logout, createRandomGuest};