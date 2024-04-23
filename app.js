const express = require ('express');



const app = express();

app.set('view engine' , 'ejs');
app.use(express.static('./public')); // to have the access to static files in the browser


app.use('/' , ( req , res)=>{
    res.render('lobby');
})



module.exports = app;