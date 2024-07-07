const MinesweeperGame = require("../classes/MinesweeperGame");
const socketController = require("./socketController");
const Player = require("../classes/Player");

const jwt = require('jsonwebtoken');
const userModel = require('../models/UserModel');

const handleJwt = async (jwtToken) => {
    try {
        const decodedToken = jwt.verify(jwtToken, process.env.APP_SECRET);
        const user = await userModel.findById(decodedToken.id);

        return {user, status: true};
    } catch (err) {
        console.error('Error handling JWT:', err);
        return {user: null, status: false};
    }
}


function socketServer(io, games , guestUsers) {

    io.on('connection', (socket) => {

        const playerId = socket.id;

        socket.on('createAGame', (data) => {

            let gameExists = false;
            games.forEach(game => {
                if (game.creator.name === data.creator) {
                    gameExists = true;
                    socket.emit('errorCreatingGame', {
                        message: 'A game exists already for ' + data.creator
                    })
                }
            });

            if (!gameExists) {
                const game = new MinesweeperGame();


                //check if the token is related to a user then add the jwt token to the player object
                handleJwt(data.jwt).then(() => {

                    game.creator = new Player(playerId, 'creator', data.creator, data.jwt);
                    games.push(game);
                    socket.join(game.id);
                    io.to(game.id).emit('gameCreatedSuccessfully', {
                        message: 'Game created successfully',
                        game
                    });
                    io.emit('receivingAllGames', {
                        games
                    });

                }).catch(err => {
                    console.log(err)
                });


            }


        });

        socket.on('join', async (data) => {
            const game = io.sockets.adapter.rooms.get(data.gameId);
            let currentGame = getGameById(data.gameId);

            let errorMessage;
            let jwt = data.jwt;


            if (game && currentGame) {
                try {
                    const results = await handleJwt(jwt);

                    if (!results.status) {

                        errorMessage = 'Unknown Error';
                        throw new Error('Invalid JWT or authentication failed');
                    }

                    // Object Minesweeper game


                    if (currentGame.creator.jwt === jwt) {

                        errorMessage = `You can't join your game!`;

                    } else {
                        if (game.size === 1 && !game.closed) {
                            socket.join(data.gameId);
                            currentGame.closed = true;

                            currentGame.joiner = new Player(socket.id, 'joiner', data.joiner, data.jwt);

                            io.to(currentGame.id).emit('gameJoinedSuccessfully', {
                                gameId: currentGame.id
                            });

                            toggleTurnOnScreen(currentGame);
                            updatePlayersInfoOnScreen(currentGame);

                            io.emit('receivingAllGames', {games});
                        } else if (currentGame.closed) {
                            errorMessage = 'The game is closed';
                        } else {
                            errorMessage = 'Unjoinable game';
                        }
                    }
                } catch (error) {
                    console.error({error});
                }
            } else if (!game || !currentGame) {
                errorMessage = 'No Game Found';
            }

            if (errorMessage) {
                io.to(playerId).emit('errorJoiningAGame', {
                    errorMessage
                });
            }
        });

        socket.on('squareClicked', async (data) => {

            let squareId = data.squareId;
            let gameId = data.gameId;
            let value;
            let currentGame;
            const jwt = data.jwt;
            let clicker;
            let opp;
            let clickerType;


            games.forEach(game => {
                if (game.id === gameId) {

                    if (game.checkPlayerClicks(jwt)) {


                        clicker = game.getPlayerByJwt(jwt);
                        opp = game.getPlayerByJwt(jwt, true);

                        clickerType = clicker.type;

                        if (game.nextClicker === clickerType) {


                            value = game.returnThenRemoveAnObject(squareId, clickerType);

                            currentGame = game;

                            io.to(clicker.id).emit('receiveSquareContent', {
                                value,
                                squareId,
                                currentGame
                            });

                            io.to(opp.id).emit('receiveSquareContent', {
                                value,
                                squareId,
                                cssClass: 'byOpp',
                                currentGame
                            });

                            toggleTurnOnScreen(currentGame);
                            updatePlayersInfoOnScreen(currentGame);

                            // check if the click ran out of lives
                            if (!game.checkPlayerLives(clickerType)) {

                                if (clickerType === 'creator') {

                                    io.to(game.creator.id).emit('noMoreLivesForYou', {
                                        gameId: game.id
                                    });
                                    io.to(game.joiner.id).emit('noMoreLivesForOpp', {
                                        gameId: game.id

                                    });


                                } else if (clickerType === 'joiner') {
                                    io.to(game.joiner.id).emit('noMoreLivesForYou', {
                                        game
                                    });
                                    io.to(game.creator.id).emit('noMoreLivesForOpp', {
                                        game
                                    });


                                }

                            }

                            // when the joiner runs out of clicks that mean the same for creator because they both have the same number of clicks
                            if (!game.joiner.clicksLeft) {
                                setTimeout(() => {


                                    checkWinnerAndCloseTheGame(game);

                                }, 1000);
                            }

                        } else {
                            socket.emit('notYourClick');
                        }
                    } else {
                        console.log(`The ${clickerType} ran out of clicks`);
                    }
                }
            });


        });

        socket.on('getAllGames', () => {
            socket.emit('receivingAllGames', {
                games
            })
        });

        socket.on('askingForPlayersInfoToUpdateOnScreen', (data) => {
            const gameId = data.gameId;

            const game = getGameById(gameId);
            updatePlayersInfoOnScreen(game);
        })

        socket.on('getGameById', (data) => {

            const currentGame = getGameById(data.id);

            io.to(currentGame.id).emit('setGameById', {
                gameId: currentGame.id
            })
        })

        socket.on('closeGame', (data) => {

            let currentGame = getGameById(data.gameId);

            if (data.jwt && data.refreshed && !data.noMoreLives && currentGame) {


                let jwt = data.jwt;

                let clicker = currentGame.getPlayerByJwt(jwt);
                let opp = currentGame.getPlayerByJwt(jwt, true);

                if (clicker) {
                    closeAGame(data.gameId);


                    if (opp) {
                        io.to(opp.id).emit('gameIsClosed', {
                            message: 'You won, Your opponent left the game!',
                            player: data.player
                        });
                    }
                    io.emit('receivingAllGames', {
                        games
                    });
                }

            }


        })

        socket.on('fired' , (data)=>{
            console.log(data.gameId);
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

        function toggleTurnOnScreen(game) {

            if (game.nextClicker === 'creator') {
                io.to(game.joiner.id).emit('toggleTurnOnScreen', {
                    turn: 'his'
                });

                io.to(game.creator.id).emit('toggleTurnOnScreen', {
                    turn: 'mine'
                });

            } else if (game.nextClicker === 'joiner') {

                io.to(game.joiner.id).emit('toggleTurnOnScreen', {
                    turn: 'mine'
                });

                io.to(game.creator.id).emit('toggleTurnOnScreen', {
                    turn: 'his'
                });
            }

        }

        function updatePlayersInfoOnScreen(game) {

            const creatorInfo = {
                lives: game.creator.lives,
                score: game.creator.score,
                clicksLeft: game.creator.clicksLeft
            };
            const joinerInfo = {
                lives: game.joiner.lives,
                score: game.joiner.score,
                clicksLeft: game.joiner.clicksLeft
            };

            io.to(game.creator.id).emit('updatePlayersInfoOnScreen', {
                yourInfo: creatorInfo,
                oppInfo: joinerInfo
            });

            io.to(game.joiner.id).emit('updatePlayersInfoOnScreen', {
                yourInfo: joinerInfo,
                oppInfo: creatorInfo
            });


        }

        function checkWinnerAndCloseTheGame(game) {
            const joinerScore = game.joiner.score;
            const creatorScore = game.creator.score;
            const comparison = joinerScore > creatorScore ? 'joiner' : (creatorScore > joinerScore ? 'creator' : 'tie');

            switch (comparison) {
                case 'joiner': {
                    io.to(game.joiner.id).emit('noClicksLeft', {
                        message: {
                            icon: 'info',
                            title: 'Congratulations!',
                            html: '<pre>' + `Your score : <span style="font-weight: bold">${joinerScore}</span> ` +
                                `Opp score :<span style="font-weight: bold">${creatorScore}</span>` + '</pre>',
                        },
                    });

                    io.to(game.creator.id).emit('noClicksLeft', {
                        message: {
                            icon: 'info',
                            title: 'You have lost!',
                            html: '<pre>' + `Your score : <span style="font-weight: bold">${creatorScore}</span> ` +
                                `Opp score :<span style="font-weight: bold">${joinerScore}</span>` + '</pre>',
                        },
                    });
                    break;
                }
                case 'creator': {

                    io.to(game.creator.id).emit('noClicksLeft', {
                        message: {
                            icon: 'info',
                            title: 'Congratulations!',
                            html: '<pre>' + `Your score : <span style="font-weight: bold">${creatorScore}</span> ` +
                                `Opp score :<span style="font-weight: bold">${joinerScore}</span>` + '</pre>',
                        },
                    });

                    io.to(game.joiner.id).emit('noClicksLeft', {
                        message: {
                            icon: 'info',
                            title: 'You have lost!',
                            html: '<pre>' + `Your score : <span style="font-weight: bold">${joinerScore}</span> ` +
                                `Opp score :<span style="font-weight: bold">${creatorScore}</span>` + '</pre>',
                        },
                    });
                    break;
                }
                case 'tie': {

                    io.to(game.creator.id).emit('noClicksLeft', {
                        message: {
                            icon: 'info',
                            title: 'It\'s a tie!',
                            html: '<pre>' + `Both players have the same score: <span style="font-weight: bold">${creatorScore}</span>` + '</pre>',
                        },
                    });

                    io.to(game.joiner.id).emit('noClicksLeft', {
                        message: {
                            icon: 'info',
                            title: 'It\'s a tie!',
                            html: '<pre>' + `Both players have the same score: <span style="font-weight: bold">${joinerScore}</span>` + '</pre>',
                        },
                    });
                    break;
                }
            }
        }


    })
}

module.exports = {socketServer}