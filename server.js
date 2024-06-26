const express = require('express');
const path = require('path');
const userRouter = require('./routes/UserRouter');
const cookieParser = require('cookie-parser');
let MinesweeperGame = require('./classes/MinesweeperGame');

let Player = require('./classes/Player');
const functions = require('./public/utils/functions');
const bcrypt = require('bcryptjs');

const {requireAuth, userIsAuthenticated} = require('./middleware/authMiddleware');
const http = require('http');
const socketIO = require('socket.io');

const dotenv = require('dotenv').config();// it must before the declaration of app
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

    const playerId = socket.id;

    socket.on('createAGame', (creatorObject) => {
        let gameExists = false;
        games.forEach(game => {
            if (game.creator.name === creatorObject.creator) {
                gameExists = true;
                socket.emit('errorCreatingGame', {
                    message: 'A game exists already for ' + creatorObject.creator
                })
            }
        });

        if (!gameExists) {
            var game = new MinesweeperGame();
            game.creator = new Player(playerId, 'creator', creatorObject.creator);

            games.push(game);
            socket.join(game.id);
            io.to(game.id).emit('gameCreatedSuccessfully', {
                message: 'Game created successfully',
                game
            });
            io.emit('receivingAllGames', {
                games
            });

        }


    });

    socket.on('join', (data) => {

        // room game
        const game = io.sockets.adapter.rooms.get(data.gameId);

        let errorMessage;

        if (game) {
            // object Minesweeper game
            let currentGame = getGameById(data.gameId);
            if (currentGame.creator.name === data.joiner) {
                errorMessage = `You can't join your game!`;

            } else {
                if (game.size === 1 && !game.closed) {
                    socket.join(data.gameId);
                    currentGame.closed = true;
                    currentGame.joiner = new Player(socket.id, 'joiner', data.joiner);
                    io.to(currentGame.id).emit('gameJoinedSuccessfully', {
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

    socket.on('toto', (data) => {
        io.to(data.playerId).emit('totoz', {
            message: 'hello there'
        });
    })

    socket.on('squareClicked', async (data) => {

        let squareId = data.squareId;
        let gameId = data.gameId;
        let value;
        let currentGame;
        const hashedPlayerType = data.hashedPlayerType;
        const clickedByJoiner = await bcrypt.compare('joiner', hashedPlayerType);
        var clicker;

        if (clickedByJoiner) {
            clicker = 'joiner';
        } else {
            clicker = 'creator';
        }

        games.forEach(game => {
            if (game.id === gameId) {

                if (game.checkPlayerClicks(clicker)) {


                    if (game.nextClicker === clicker) {


                        value = game.returnThenRemoveAnObject(squareId, clicker);

                        currentGame = game;
                        io.to(data.gameId).emit('receiveSquareContent', {
                            value,
                            squareId,
                            currentGame
                        });

                        // check if the click ran out of lives
                        if(!game.checkPlayerLives(clicker)){

                            if(clicker === 'creator'){

                                io.to(game.creator.id).emit('noMoreLivesForYou' , {
                                    game
                                });
                                io.to(game.joiner.id).emit('noMoreLivesForOpp' , {
                                    game
                                });



                            }else if(clicker === 'joiner'){
                                io.to(game.joiner.id).emit('noMoreLivesForYou' , {
                                    game
                                });
                                io.to(game.creator.id).emit('noMoreLivesForOpp' , {
                                    game
                                });


                            }

                        }


                        // when the joiner runs out of clicks that mean the same for creator because they both have the same number of clicks
                        if (!game.joiner.clicksLeft) {
                            setTimeout(() => {
                                io.to(game.id).emit('noClicksLeft', {
                                    message: 'No clicks left for both players',
                                    game
                                });
                            }, 1000);
                        }

                    } else {
                        socket.emit('notYourClick');
                    }
                } else {
                    console.log(`The ${clicker} ran out of clicks`);
                }
            }


        });


    });

    socket.on('getAllGames', () => {
        socket.emit('receivingAllGames', {
            games
        })
    });

    socket.on('getGameById', (data) => {

        const currentGame = getGameById(data.id);

        io.to(currentGame.id).emit('setGameById', {
            game: currentGame
        })
    })

    socket.on('closeGame', (data) => {

        closeAGame(data.gameId);

        io.emit('receivingAllGames', {
            games
        });


        if (!data.noMoreLives && data.refreshed) {

            io.to(data.gameId).emit('gameIsClosed', {
                message: 'You won, Your opponent left the game!',
                player: data.player
            });

        }


    })

    function closeAGame(id) {

        const index = games.findIndex(game => game.id === id);

        if (index !== -1) {
            games.splice(index, 1);
        }
    }

    function getGameById(gameId) {
        for (let game of games) { // using return with forEach will exit the forEach and not the whole function
            if (game.id === gameId) {
                return game;
            }
        }
        return 0;
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
    var hashedPlayerType;


    if (joiner) {
        let gameToJoin = games.find(game => game.id === gameId);
        hashedPlayerType = await bcrypt.hash('joiner', saltRounds);
        if (!gameToJoin) {

            return res.json({'Error': 'No game found with the provided ID'});
        }
    } else {

        hashedPlayerType = await bcrypt.hash('creator', saltRounds);

    }

    res.render('game', {creator, joiner, gameId, hashedPlayerType});
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
