const express = require('express');
const path = require('path');
const userRouter = require('./routes/UserRouter');
const cookieParser = require('cookie-parser');
const { userIsAuthenticated, requireAuth} = require('./middleware/authMiddleware');
const http = require('http');
const socketIO = require('socket.io');
const socketController = require('./controllers/socketController');
const dotenv = require('dotenv').config();// it must before the declaration of app

const connectToDB = require('./DBConnection');

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

connectToDB().then(() => {
    // no errors
})
    .catch(err => {
        console.log(err);
        process.exit(1);
    });

let games = [];
let user = {id : 2 , toto : "heha"};

let guestUsers = new Map();

guestUsers.set('user' , user);


socketController.socketServer(io ,games , guestUsers);

server.listen(port, () => {
    console.log(`Port: ${port}`);
    console.log('Server connected');
})

// inject the middleware for all request , the middleware will check if the token is valid then pass the user
app.use(userIsAuthenticated);
app.get('/', accessToLoginSignupPage, (req, res) => {
    res.render('home', {pageTitle: 'Sign In or Create an Account'});
});


app.use('/user', userRouter.router);
app.post('/game', requireAuth,  async (req, res) => {

    const creator = req.body.creator ? req.body.creator : null;
    const joiner = req.body.joiner ? req.body.joiner : null;
    const gameName = req.body.gameName ? req.body.gameName : req.body.creator;
    const gameId = req.body.gameId;

    const pageTitle = gameName+' - Game';

    const user = res.locals.user;

    console.log(gameName);

    res.render('game', {creator, joiner, gameId , gameName , pageTitle });
});

app.post('/checkGame', (req, res) => {

    // token from the browser
    let token = req.cookies.jwt;
    let gameId = req.body.gameId;

    let gameToJoin = games.find(game => game.id === gameId);

    if (!gameToJoin) {
        res.redirect('lobby?err=x')

    } else if (token === gameToJoin.creator.jwt) {
        res.redirect('lobby?err=n')
    }

    res.redirect(307, '/game');
});


app.get('/lobby' , requireAuth, (req, res) => {
    res.render('lobby', {pageTitle: 'Lobby Page'});

});

app.get('/set-cookies', (req, res) => {
    res.cookie('newUser', false, {maxAge: 1000 * 60 * 60 * 24, secure: true}); // secure will be set only with secured connections
    res.send('new USer');
});

app.get('/get-cookies', (req, res) => {
    const cookies = req.cookies;

    res.json(cookies);
});

app.use((req,res,next)=>{
    res.status(404).render('404' , {pageTitle : 'Page Not Found'})
})


module.exports = {server , guestUsers};
