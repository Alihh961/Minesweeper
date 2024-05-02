const express = require('express');
const path = require('path');
const userRouter = require('./routes/UserRouter');
let crypto = require('crypto');
let MinesweeperGame = require('./classes/MinesweeperGame');

const http = require('http');
const socketIO = require('socket.io');

const dotenv = require('dotenv');
dotenv.config({path: './config.env'}); // it must before the declaration of app
const mongoose = require('mongoose');

const app = express();
let server = http.createServer(app);
let io = socketIO(server);


const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, './public');
app.set('view engine', 'ejs');
app.use(express.json()); //to add the request body sent of the api to the request body
app.use(express.static(publicPath)); // to have the access to static files in the browser
app.use(express.urlencoded({extended: true})); // to receive data using post method


mongoose.connect(`${process.env.DATABASE_URI}/Minesweeper`).then((conn) => {
    // console.log(conn);
    console.log('Connected successfully to the database');
}).catch((err) => {
    console.log(err);
});


// const server = app.listen(port , ()=>{
//     console.log(`Server started at port : ${port}`);
// });


io.on('connection', (socket) => {

    let game = new MinesweeperGame();


    socket.broadcast.emit('newUserConnected' ,{
        message : 'New user is connected'
    } );

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('squareClicked', (data) => {
        let id = data.id;
        const value = game.returnThenRemoveAnObject(id);

        socket.emit('receiveSquareContent', {
            value,
            id
        });

    });

    // socket.emit('newMessage', {
    //     text: 'new message',
    //     sender: 'toto'
    // });
    socket.on('sendMessageToAllUsers', (data) => {
        // io.emit('newMessage' , { // broadcasting to all connected users even the user who did the event
        //     message : data.text
        // });

        socket.broadcast.emit('newMessage', { // broadcasting to all connected users except the one who did the event

            message: data.text,
            from:data.from,
        })
    });


});


server.listen(port || 3000, () => {
    console.log('Server connected');
})

app.get('/', (req, res) => {
    res.render('home' );
});

app.use('/user', userRouter.router);
app.post('/game', (req, res) => {


    res.render('game');
});

app.use('/lobby', (req, res) => {
    res.render('lobby');
});


module.exports = server;
