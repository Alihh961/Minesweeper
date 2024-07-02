const express = require("express");
const path = require("path");
const userRouter = require("../routes/UserRouter");
const cookieParser = require("cookie-parser");
let MinesweeperGame = require("../classes/MinesweeperGame");

const JWT = require("jsonwebtoken");

let Player = require("../classes/Player");
const functions = require("../public/utils/functions");
const bcrypt = require("bcryptjs");

const {
  requireAuth,
  userIsAuthenticated,
} = require("../middleware/authMiddleware");
const http = require("http");
const socketIO = require("socket.io");
const socketController = require("../controllers/socketController");

const dotenv = require("dotenv").config(); // it must before the declaration of app
const mongoose = require("mongoose");

const app = express();
let server = http.createServer(app);
let io = socketIO(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "ejs");

//middlewares
app.use(express.json()); //to add the request body sent of the api to the request body
app.use(cookieParser());
const {
  accessToLoginSignupPage,
} = require("../middleware/restrictUserAccessMiddleware");

app.use(express.static(publicPath)); // to have the access to static files in the browser
app.use(express.urlencoded({ extended: true })); // to receive data using post method

mongoose
  .connect(`${process.env.DATABASE_URI}/Minesweeper`)
  .then((conn) => {
    // console.log(conn);
    console.log("Connected successfully to the database");
  })
  .catch((err) => {
    console.log(err);
  });

let games = [];

io.on("connection", (socket) => {
  const playerId = socket.id;

  socket.on("createAGame", (data) => {
    let gameExists = false;
    games.forEach((game) => {
      if (game.creator.name === data.creator) {
        gameExists = true;
        socket.emit("errorCreatingGame", {
          message: "A game exists already for " + data.creator,
        });
      }
    });

    if (!gameExists) {
      var game = new MinesweeperGame();

      //check if the token is related to a user then add the jwt token to the player object
      socketController
        .handleJwt(data.jwt)
        .then((results) => {
          game.creator = new Player(
            playerId,
            "creator",
            data.creator,
            data.jwt
          );
          games.push(game);
          socket.join(game.id);
          io.to(game.id).emit("gameCreatedSuccessfully", {
            message: "Game created successfully",
            game,
          });
          io.emit("receivingAllGames", {
            games,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  socket.on("join", async (data) => {
    const game = io.sockets.adapter.rooms.get(data.gameId);
    let currentGame = getGameById(data.gameId);

    let errorMessage;
    let jwt = data.jwt;

    if (game && currentGame) {
      try {
        const results = await socketController.handleJwt(jwt);

        if (!results.status) {
          errorMessage = "Unknown Error";
          throw new Error("Invalid JWT or authentication failed");
        }

        // Object Minesweeper game

        if (currentGame.creator.jwt === jwt) {
          errorMessage = `You can't join your game!`;
        } else {
          if (game.size === 1 && !game.closed) {
            socket.join(data.gameId);
            currentGame.closed = true;

            currentGame.joiner = new Player(
              socket.id,
              "joiner",
              data.joiner,
              data.jwt
            );

            io.to(currentGame.id).emit("gameJoinedSuccessfully", {
              game: currentGame,
            });

            io.emit("receivingAllGames", { games });
          } else if (currentGame.closed) {
            errorMessage = "The game is closed";
          } else {
            errorMessage = "Unjoinable game";
          }
        }
      } catch (error) {
        console.error({ error });
      }
    } else if (!game || !currentGame) {
      errorMessage = "No Game Found";
    }

    if (errorMessage) {
      io.to(playerId).emit("errorJoiningAGame", {
        errorMessage,
      });
    }
  });

  socket.on("squareClicked", async (data) => {
    let squareId = data.squareId;
    let gameId = data.gameId;
    let value;
    let currentGame;
    const jwt = data.jwt;
    let clicker;

    games.forEach((game) => {
      if (game.id === gameId) {
        if (game.checkPlayerClicks(jwt)) {
          clicker = game.getPlayerByJwt(jwt).type;
          if (game.nextClicker === clicker) {
            value = game.returnThenRemoveAnObject(squareId, clicker);

            currentGame = game;

            io.to(data.gameId).emit("receiveSquareContent", {
              value,
              squareId,
              currentGame,
            });

            // check if the click ran out of lives
            if (!game.checkPlayerLives(clicker)) {
              if (clicker === "creator") {
                io.to(game.creator.id).emit("noMoreLivesForYou", {
                  game,
                });
                io.to(game.joiner.id).emit("noMoreLivesForOpp", {
                  game,
                });
              } else if (clicker === "joiner") {
                io.to(game.joiner.id).emit("noMoreLivesForYou", {
                  game,
                });
                io.to(game.creator.id).emit("noMoreLivesForOpp", {
                  game,
                });
              }
            }

            // when the joiner runs out of clicks that mean the same for creator because they both have the same number of clicks
            if (!game.joiner.clicksLeft) {
              setTimeout(() => {
                io.to(game.id).emit("noClicksLeft", {
                  message: "No clicks left for both players",
                  game,
                });
              }, 1000);
            }
          } else {
            socket.emit("notYourClick");
          }
        } else {
          console.log(`The ${clicker} ran out of clicks`);
        }
      }
    });
  });

  socket.on("getAllGames", () => {
    socket.emit("receivingAllGames", {
      games,
    });
  });

  socket.on("getGameById", (data) => {
    const currentGame = getGameById(data.id);

    io.to(currentGame.id).emit("setGameById", {
      game: currentGame,
    });
  });

  socket.on("closeGame", (data) => {
    let currentGame = getGameById(data.gameId);

    if (data.jwt && data.refreshed && !data.noMoreLives && currentGame) {
      let jwt = data.jwt;

      let clicker = currentGame.getPlayerByJwt(jwt);
      let opp = currentGame.getPlayerByJwt(jwt, true);

      if (clicker) {
        closeAGame(data.gameId);

        io.to(opp.id).emit("gameIsClosed", {
          message: "You won, Your opponent left the game!",
          player: data.player,
        });

        io.to(clicker.id).emit("gameIsClosed", {
          message: "You left the game!",
          player: data.player,
        });

        io.emit("receivingAllGames", {
          games,
        });
      }
    }
  });

  function closeAGame(id) {
    const index = games.findIndex((game) => game.id === id);

    if (index !== -1) {
      games.splice(index, 1);
    }
  }

  function getGameById(gameId) {
    for (let game of games) {
      // using return with forEach will exit the forEach and not the whole function
      if (game.id === gameId) {
        return game;
      }
    }
    return 0;
  }
});

server.listen(port, () => {
  console.log(port);
  console.log("Server connected");
});

// inject the middleware for all request , the middleware will check if the token is valid then pass the user
app.use(userIsAuthenticated);
app.get("/", accessToLoginSignupPage, (req, res) => {
  res.render("home", { pageTitle: "Sign In or Create an Account" });
});

app.use("/user", userRouter.router);
app.post("/game", async (req, res) => {
  const creator = req.body.creator ? req.body.creator : null;
  const joiner = req.body.joiner ? req.body.joiner : null;
  const gameId = req.body.gameId;

  const user = res.locals.user;

  res.render("game", { creator, joiner, gameId, pageTitle: `Game` });
});

app.post("/checkGame", (req, res) => {
  // token from the browser
  let token = req.cookies.jwt;
  let gameId = req.body.gameId;

  let gameToJoin = games.find((game) => game.id === gameId);

  if (!gameToJoin) {
    res.redirect("lobby?err=x");
  } else if (token === gameToJoin.creator.jwt) {
    res.redirect("lobby?err=n");
  }

  res.redirect(307, "/game");
});

app.use("/lobby", requireAuth, (req, res) => {
  res.render("lobby", { pageTitle: "Lobby Page" });
});

app.get("/set-cookies", (req, res) => {
  res.cookie("newUser", false, { maxAge: 1000 * 60 * 60 * 24, secure: true }); // secure will be set only with secured connections
  res.send("new USer");
});

app.get("/get-cookies", (req, res) => {
  const cookies = req.cookies;

  res.json(cookies);
});

module.exports = server;
