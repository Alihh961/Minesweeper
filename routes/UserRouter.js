const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const userModel = require('../models/UserModel');



const checkUsername = async (req, res) => {

    const userName= req.body.username;
    const saveBoolean = req.body.save;

    console.log(req.body);
    try {
        const user = await userModel.findOne({userName: userName});

        if (user) {

            res.status(409).json({error: 'Username already exists' , status : 409});

        } else {
            const newUser = new userModel({
                userName: userName
            });
            if(saveBoolean){
                await newUser.save();

            }
            console.log(saveBoolean);

            res.status(201).json({message: "Username added successfully" , status : 201});
        }
    } catch (error) {

        res.status(500).json({error: 'An Error Occurred while checking username' , status : 500});
    }


};

router.post('/check-username', checkUsername);


module.exports = {router};
