const express = require ('express');
const userRouter = require('./routes/UserRouter');


const app = express();
app.set('view engine' , 'ejs');
app.use(express.json()); //to add the request body sent of the api to the request body
app.use(express.static('./public')); // to have the access to static files in the browser

app.use(express.urlencoded({ extended: true })); // to receive data using post method
// app.use('/check/:username' , UsernameRouter.checkUsername);
app.use('/home' , (req , res)=>{
    res.render('home');
});

app.use('/user' , userRouter.router);
app.use('/' , ( req , res)=>{
    res.render('lobby');
});


module.exports = app;