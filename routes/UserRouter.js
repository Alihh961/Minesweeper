const express = require('express');
const router = express.Router();
const authController =  require('../controllers/authController');

const mongoose = require('mongoose');
const userModel = require('../models/UserModel');




router.post('/signup', authController.signup);
router.post('/login' , authController.login);


module.exports = {router};
