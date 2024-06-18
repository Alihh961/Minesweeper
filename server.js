const express = require('express');
const path = require('path');
const userRouter = require('./routes/UserRouter');
const cookieParser = require('cookie-parser');
let MinesweeperGame = require('./classes/MinesweeperGame');
const functions = require('./public/utils/functions');
const bcrypt = require('bcryptjs');

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

    socket.on('createAGame', (creatorObject) => {
        let gameExists = false;
        games.forEach(game => {
            if (game.creator === creatorObject.creator) {
                gameExists = true;
                socket.emit('errorCreatingGame', {
                    message: 'A game exists already for ' + creatorObject.creator
                })
            }
        });

        if (!gameExists) {
            var game = new MinesweeperGame();
            game.creator = creatorObject.creator;
            games.push(game);
            socket.join(game.id);
            socket.emit('gameCreatedSuccessfully', {
                message: 'Game created successfully',
                game
            });
            io.emit('receivingAllGames', {
                games
            });

        }


    });

    socket.on('updateTime' , (data)=>{
        let game = getGameById(data.gameId);
        let player = data.player;

        if(data.deduct){

            if(player === 'creator'){
                game.creatorTime -= 1;
                if(game.creatorTime >= 0){
                    socket.emit('ranOfTime' , {
                        message : 'Ran of time',
                        player : 'creator'
                    })
                }
            }else if(player === 'joiner'){
                game.joinerTime -= 1;
                if(game.joinerTime >= 0){
                    socket.emit('ranOfTime' , {
                        message : 'Ran of time',
                        player : 'creator'
                    })
                }
            }

        }



    io.to(data.gameId).emit('updateGameInfo' , {
        game
    })

    });



    socket.on('join', (data) => {

        // room game
        const game = io.sockets.adapter.rooms.get(data.gameId);

        let errorMessage;

        if (game) {
            // object Minesweeper game
            let currentGame = getGameById(data.gameId);
            if (currentGame.creator === data.joiner) {
                errorMessage = `You can't join your game!`;

            } else {
                if (game.size === 1 && !game.closed) {
                    socket.join(data.gameId);
                    currentGame.closed = true;
                    currentGame.joiner = (data.joiner);
                    socket.emit('gameJoinedSuccessfully', {
                        game: currentGame
                    });

                } else if (currentGame.closed) {
                    errorMessage = 'The game is closed ';
                } else {
                    errorMessage = 'Unjoinable game ';

                }
            }


        } else {
            errorMessage = 'No Game Found';
        }
        if (errorMessage) {
            socket.emit('errorJoiningAGame', {
                errorMessage
            });

        }

    });

    function getGameById(gameId) {
        for (let game of games) { // using return with forEach will exit the forEach and not the whole function
            if (game.id === gameId) {
                return game;
            }
        }
        return 0;
    };


    socket.on('squareClicked', async (data) => {
        let squareId = data.squareId;
        let gameId = data.gameId;
        let value;
        let currentGame;
        const hashedPlayerType = data.hashedPlayerType;
        const clickedByJoiner = await bcrypt.compare('joiner' , hashedPlayerType);
        var clicker;

        if(clickedByJoiner){
            clicker = 'joiner';
        }else{
            clicker = 'creator';

        }
        games.forEach(game => {
            if (game.id == gameId) {
                value = game.returnThenRemoveAnObject(squareId ,clicker);
                currentGame = game;
            }


        });

        io.to(data.gameId).emit('receiveSquareContent', {
            value,
            squareId,
            currentGame
        });


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

    socket.on('closeGame', (data) => {

        closeAGame(data.gameId);

        io.emit('receivingAllGames', {
            games
        });


        if(!data.noMoreLives && data.refreshed ){

            io.to(data.gameId).emit('gameIsClosed', {
                message: 'You won, Your opponent left the game!',
                player : data.player
            });

        }



    })

    function closeAGame(id) {

        const index = games.findIndex(game => game.id === id);

        if (index !== -1) {
            games.splice(index, 1);
        }
    }


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
app.post('/game', async (req, res) => {

    const creator = req.body.creator ? req.body.creator : null;
    const joiner = req.body.joiner ? req.body.joiner : null;
    const gameId = req.body.gameId;

    const saltRounds = 10;
    var hashedPlayerType ;





    if (joiner) {
        let gameToJoin = games.find(game => game.id === gameId);
        hashedPlayerType = await bcrypt.hash('joiner' , saltRounds);
        if (!gameToJoin) {

            return res.json({'Error': 'No game found with the provided ID'});
        }
    }else{

        hashedPlayerType = await bcrypt.hash('creator' , saltRounds);

    }

    res.render('game', {creator, joiner, gameId , hashedPlayerType });
});


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
