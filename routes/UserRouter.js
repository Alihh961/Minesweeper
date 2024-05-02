const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const userModel = require('../models/UserModel');


const checkUsername = async ( req, res ,next ) => {

    const userName = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedPassword;

    const saveBoolean = req.body.save;


    try {
        const usernameExists = await userModel.findOne({userName: userName});

        if (usernameExists) {

            throw { message: 'Username already exists', statusCode: 409 };

        }
        const emailExists = await userModel.findOne({email :email});

        if (emailExists) {

            throw { message: 'Email already exists', statusCode: 409 };


        }
        if(password !== confirmedPassword){
            throw { message: "Passwords don't match", statusCode: 400 };

        }
        if(password.length < 8){
            throw { message: "Password Error: 8 letters at least", statusCode: 400 };

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

        return res.json({ message : error.message , code : error.statusCode });
    }


};

router.post('/check-username', checkUsername);


module.exports = {router};
