const dotenv = require('dotenv');
dotenv.config({path :'./config.env'}); // it must before the declaration of app
const mongoose  = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;



mongoose.connect(`${process.env.DATABASE_URI}/Minesweeper`).then((conn)=>{
    // console.log(conn);
    console.log('Connected successfully to the database');
}).catch((err)=>{
    console.log(err)
});


app.listen(port , ()=>{
    console.log(`Server started at port : ${port}`);
});