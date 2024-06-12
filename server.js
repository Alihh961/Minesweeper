const express = require('express');
const path = require('path');
const userRouter = require('./routes/UserRouter');
const cookieParser = require('cookie-parser');
let MinesweeperGame = require('./classes/MinesweeperGame');

const {requireAuth, userIsAuthenticated} = require('./middleware/authMiddleware');
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

//middlewares
app.use(express.json()); //to add the request body sent of the api to the request body
app.use(cookieParser());
const {accessToLoginSignupPage} = require('./middleware/restrictUserAccessMiddleware');


app.use(express.static(publicPath)); // to have the access to static files in the browser
app.use(express.urlencoded({extended: true})); // to receive data using post method


mongoose.connect(`${process.env.DATABASE_URI}/Minesweeper`).then((conn) => {
    // console.log(conn);
    console.log('Connected successfully to the database');
}).catch((err) => {
    console.log(err);
});

let games = [];


io.on('connection', (socket) => {

    function getGameById(gameId) {
        for (let game of games) { // using return with forEach will exit the forEach and not the whole function
            if (game.id == gameId) {
                return game;
            }
        }
        return 0;
    }

    socket.on('squareClicked', (data) => {
        let squareId = data.squareId;
        let gameId = data.gameId;
        let value ;
        let currentGame ;

        games.forEach(game=>{
            if(game.id == gameId){
                value = game.returnThenRemoveAnObject(squareId);
                currentGame = game;
            }
        });

        socket.emit('receiveSquareContent', {
            value,
            squareId,
            currentGame
        });

    });

    socket.on('getAllGames',()=>{
        socket.emit('receivingAllGames',{
            games
        })
    });

    socket.on('getGameById' , (data)=>{

        const currentGame = getGameById(data.id);

        socket.emit('setGameById' , {
            game : currentGame
        })
    })

    socket.on('closeGame' , ()=>{

    })




});



server.listen(port , () => {
    console.log(port);
    console.log('Server connected');
})

// inject the middleware for all request , the middleware will check if the token is valid then pass the user
app.use(userIsAuthenticated);
app.get('/',accessToLoginSignupPage ,(req, res) => {

    res.render('home' );
});

app.use('/user', userRouter.router);
app.post('/game', (req, res) => {

const creator = req.body.creator ? req.body.creator : null;
const player = req.body.player ? req.body.player : null;
const gameId = req.body.gameId;

    // const urlParams = new URLSearchParams(window.location.search);
    // const xCreator = urlParams.get('creator');


    if(!creator){
        res.redirect('game?gameId='+player);
    }

games.forEach(game=>{
    if(game.creator === creator){
        res.json({'Error' : 'A game already exists for the player ' + creator})
    }

});
var game = new MinesweeperGame();

game._setCreator(creator);

games.push(game);

    res.render('game' , { gameId : game.id , creator});
});


app.get('/game-join' , (req ,res)=>{

    let gameId = req.body.gameId;
    res.render('game' , {gameId});
})
app.use('/lobby', requireAuth ,  (req, res) => {

    res.render('lobby');
});

app.get('/set-cookies' , (req, res)=>{
    res.cookie('newUser' ,false , {maxAge:1000 * 60 * 60 * 24 ,secure : true }); // secure will be set only with secured connections
    res.send('new USer');
});

app.get('/get-cookies',  (req , res )=>{
    const cookies = req.cookies;

    res.json(cookies);
})




module.exports = server;
