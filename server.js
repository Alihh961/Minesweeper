const express = require ('express');
const path = require('path');
const userRouter = require('./routes/UserRouter');
let MinesweeperGame = require('./classes/MinesweeperGame');

const http = require('http');
const socketIO = require('socket.io');

const dotenv = require('dotenv');
dotenv.config({path :'./config.env'}); // it must before the declaration of app
const mongoose  = require('mongoose');

const app = express();
let server = http.createServer(app);
let io = socketIO(server);


const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname , './public');
app.set('view engine' , 'ejs');
app.use(express.json()); //to add the request body sent of the api to the request body
app.use(express.static(publicPath)); // to have the access to static files in the browser
app.use(express.urlencoded({ extended: true })); // to receive data using post method


mongoose.connect(`${process.env.DATABASE_URI}/Minesweeper`).then((conn)=>{
    // console.log(conn);
    console.log('Connected successfully to the database');
}).catch((err)=>{
    console.log(err);
});


// const server = app.listen(port , ()=>{
//     console.log(`Server started at port : ${port}`);
// });



io.on('connection' , (socket)=>{

    let game = new MinesweeperGame();


    console.log('A new user just connected');

    socket.on('disconnect' , ()=>{
        console.log('User disconnected');
    });

    socket.on('squareClicked' , (data)=>{
        let id = data.id;
        const value = game.returnThenRemoveAnObject(id);

        socket.emit('receiveSquareContent' , {
        value ,
            id
        });

    });

});



server.listen(port || 3000 , ()=>{
    console.log('Server connected');
})

app.get('/home' , (req , res)=>{
    res.render('home');
});

app.use('/user' , userRouter.router);
app.use('/' , ( req , res)=>{
    res.render('lobby');
});


module.exports = server;
