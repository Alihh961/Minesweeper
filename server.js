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

    socket.on('test', (data) => {
        if (io.sockets.adapter.rooms.has(data.id)) {
            io.to(data.id).emit('message', 'content for room 123');
            console.log('Message sent to room 123');
        } else {
            console.log('Room 123 does not exist');
            // Optionally emit an event or handle the absence of the room
        }
    });


    socket.on('createAGame', (creatorObject)=>{
        let gameExists = false;
        games.forEach(game => {
            if (game.creator === creatorObject.creator) {
                gameExists = true;
                socket.emit('errorCreatingGame' , {
                    message : 'A game exists already for ' + creatorObject.creator
                })
            }
        });

        if(!gameExists){
            var game = new MinesweeperGame();
            game._setCreator(creatorObject.creator);
            games.push(game);
            socket.join(game.id);
            socket.emit('gameCreatedSuccessfully' , {
                message : 'Game created successfully' ,
                game
            });


        }


    });

    socket.on('join' , (data)=>{

        const game = io.sockets.adapter.rooms.get(data.gameId);

        if(game && game.size == 1 ){
            socket.join(data.gameId);
            socket.emit('gameJoinedSuccessfully' , {
                gameId : data.gameId
            })
        }
    });
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
        let value;
        let currentGame;

        games.forEach(game => {
            if (game.id == gameId) {
                value = game.returnThenRemoveAnObject(squareId);
                currentGame = game;
            }


        });

        io.to(data.gameId).emit('receiveSquareContent',{
            value,
            squareId,
            currentGame
        } );


    });

    socket.on('getAllGames', () => {
        socket.emit('receivingAllGames', {
            games
        })
    });

    socket.on('getGameById', (data) => {

        const currentGame = getGameById(data.id);

        socket.emit('setGameById', {
            game: currentGame
        })
    })

    socket.on('closeGame', () => {

    })


});


server.listen(port, () => {
    console.log(port);
    console.log('Server connected');
})

// inject the middleware for all request , the middleware will check if the token is valid then pass the user
app.use(userIsAuthenticated);
app.get('/', accessToLoginSignupPage, (req, res) => {

    res.render('home');
});

app.use('/user', userRouter.router);
app.get('/game', (req, res) => {

    const creator = req.query.creator ? req.query.creator : null;
    const joiner = req.query.joiner ? req.query.joiner : null;
    const gameId = req.query.gameId;


    // const urlParams = new URLSearchParams(window.location.search);
    // const xCreator = urlParams.get('creator');


    if (joiner) {
        let gameToJoin = games.find(game => game.id === gameId);

        if (!gameToJoin){

            return res.json({ 'Error': 'No game found with the provided ID' });
        }
    }




    res.render('game');
});


app.get('/game-join', (req, res) => {

    let gameId = req.body.gameId;
    res.render('game', {gameId});
})
app.use('/lobby', requireAuth, (req, res) => {

    res.render('lobby');
});

app.get('/set-cookies', (req, res) => {
    res.cookie('newUser', false, {maxAge: 1000 * 60 * 60 * 24, secure: true}); // secure will be set only with secured connections
    res.send('new USer');
});

app.get('/get-cookies', (req, res) => {
    const cookies = req.cookies;

    res.json(cookies);
})


module.exports = server;
