// i must solve the problem on refresh it shows that i won while it must check who refreshed the page and show dif msgs

// check the game name in lobby page
let socket = io();

document.body.style.overflow = 'hidden';

window.player = {};

const creator = document.querySelector("input[name='creator']").value;
const joiner = document.querySelector("input[name='joiner']").value;
const gameId = document.querySelector("input[name='gameId']").value;
const loggedUser = document.querySelector("input[name='loggedUser']").value;
const hashedPlayerType = document.querySelector("input[name='hashedPlayerType']").value;


window.hashedPlayerType = hashedPlayerType;

if (creator) {

    socket.emit('createAGame', {creator: creator});
    window.player.type = 'creator';

    document.body.style.pointerEvents = 'none';
    document.body.classList.add('game-not-started');


} else if (joiner) {
    socket.emit('join', {joiner: loggedUser, gameId: gameId});
    window.player.type = 'joiner';
} else {
    window.location.href = '/lobby';
}

socket.on('errorJoiningAGame', function (error) {
    Swal.fire({
        icon: "error",
        text: error.errorMessage,
    }).then(() => {
        window.location.href = '/lobby';
    });
})
socket.on('gameCreatedSuccessfully', function (data) {

    console.log({game : data});
    window.game = data.game;


});

// starting the game
socket.on('gameJoinedSuccessfully', function (data) {
    document.body.style.pointerEvents = 'auto';
    document.body.classList.remove('game-not-started');

    const msgCreatorClickFirst = document.querySelector('.game-main-section .msg-creator-start-first');

    msgCreatorClickFirst.classList.add('fadeOut');

    const squaresContainer = document.querySelector('.mines-container');

    for (let i = 0; i < 100; i++) {
        var span = document.createElement('span');

        span.classList.add('square');
        span.setAttribute('data-square', `${i}`);

        squaresContainer.appendChild(span);
    }
    updatePlayersInfo(data.game);


    var squares = document.querySelectorAll('.square');
    if (squares) {
        squares.forEach((square) => {
            square.addEventListener('click', (event) => {
                let clickedSquare = event.target;
                let squareId = clickedSquare.getAttribute('data-square');


                document.querySelector('.msg-creator-start-first').style.display = 'none';

                if(window.player.type === 'joiner' || window.player.type === 'creator'){
                    // Emit the squareClicked event to the server
                    socket.emit('squareClicked', {
                        message: 'A square was clicked!',
                        squareId,
                        gameId: window.game.id,
                        hashedPlayerType

                    });
                    // changeClicksLeft(window.player.type);

                }else{
                    socket.emit('closeGame' , {
                        gameId
                    })
                    Swal.fire({
                        icon : 'error',
                        title : 'Error' ,

                    }).then(function(){
                        window.location.href ='lobby';
                    })
                }



            });
        });
    }



});

socket.on('errorCreatingGame', (error) => {
    Swal.fire({
        icon: "error",
        text: "A game already running for " + loggedUser,
    }).then(() => {
        window.location.href = 'lobby'
    });
})

socket.on('notYourClick' , function(data){
    Swal.fire({
        icon : "error" ,
        title : "Wait" ,
        text : "It is not your turn yet!"
    })
});


socket.on('receiveSquareContent', function (data) {




    const creatorLives = data.currentGame.creator.lives;
    const joinerLives = data.currentGame.joiner.lives;

    console.log('received')


    let clickedSquare = document.querySelector(`[data-square="${data.squareId}"]`);
    let value = data.value;

    if (clickedSquare) {

window.game = data.currentGame;

        if (typeof (value) === "number") {
            clickedSquare.innerHTML = data.value;

            if (!clickedSquare.classList.contains('opened')) {
                clickedSquare.classList.add('joiner');

            }

            clickedSquare.classList.add('opened');


        } else if (value === "-") {
            if (!clickedSquare.classList.contains('opened')) {
                clickedSquare.classList.add('joiner');

            }
            clickedSquare.classList.add('mine');
            clickedSquare.innerHTML = "\u26CC";
            clickedSquare.classList.add('opened');


        } else if (value === "+") {

            if (!clickedSquare.classList.contains('opened')) {
                clickedSquare.classList.add('joiner');

            }
            clickedSquare.classList.add('heart');
            clickedSquare.innerHTML = "\u2665";
            clickedSquare.classList.add('opened');


        } else {
            console.error("Error while adding content to a square")
        }

        updatePlayersInfo(data.currentGame);

    }else{
        socket.emit('closeGame' , {
            gameId : window.game.id
        });

        Swal.fire({
            icon :"error" ,
            title : 'Error',
            text : 'Something went wrong!'
        }).then(function (){
            window.location.href = '/lobby';
        })

    }
});


// when there is no clicks this event will be executed 2 seconds after the last click
socket.on('noClicksLeft' , function (data){

    onNoMoreClickLeft(data.game);
});

socket.on('noMoreLivesForOpp' , function(data){

    Swal.fire({
        title: 'Congratulations!',
        text: 'You have won, Your opponent has no more lives',
        icon: 'success',
        showConfirmButton: false
    });

    socket.emit('closeGame' , {
        gameId : data.game.id
    })

    setTimeout(function(){
        window.location.href ='lobby';

    },7000);


});

socket.on('noMoreLivesForYou' , function(data){

    Swal.fire({
        title: 'Sorry, out of lives',
        text: 'You have lost the game!',
        icon: 'error',
        showConfirmButton: false
    });

    socket.emit('closeGame' , {
        gameId : data.game.id
    })

    setTimeout(function(){
        window.location.href ='lobby';

    },7000);
})




window.addEventListener('beforeunload', () => {
    if (window.game.id) {
        let player = window.player.type;
        socket.emit('closeGame', {
            gameId: window.game.id,
            message: 'close the game of id ' + window.game.id,
            player,
            refreshed: true
        });
    }

});


if (gameId) {
    socket.emit('getGameById', {
        id: gameId
    });

}


socket.on('setGameById', (data) => {
    window.game = data.game;

});


// show won message when the opponent leaves the game
socket.on('gameIsClosed', function (data) {
    if (window.player.type !== data.player) {
        Swal.fire({
            title: data.message,
            confirmButtonText: "Back to lobby",
            showClass: {
                popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `
            },
            hideClass: {
                popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `
            }
        }).then(function () {
            window.location.href = '/lobby';
        });
    }

});

socket.on('updateGameInfo', (data) => {
    window.game = data.game;

})

socket.on('ranOfClicks' , function(data){
    Swal.fire({
        icon : 'info' ,
        title : 'Game Ended',
        text : 'Game ended for running out of clicks'
    })
})


function updatePlayersInfo(game) {
    const creator = game.creator;
    const joiner = game.joiner;

    console.log(game);

    if (window.player.type === 'joiner') {

        document.querySelector('.your-lives span').textContent = joiner.lives;
        document.querySelector('.your-score span').textContent = joiner.score;
        document.querySelector('.opp-lives span').textContent = creator.lives;
        document.querySelector('.opp-score span').textContent = creator.score;
        document.querySelector('.opp-clicks-left').textContent = creator.clicksLeft;
        document.querySelector('.your-clicks-left').textContent = joiner.clicksLeft;


    } else if (window.player.type === 'creator') {

        document.querySelector('.your-lives span').textContent = creator.lives;
        document.querySelector('.your-score span').textContent = creator.score;
        document.querySelector('.opp-lives span').textContent = joiner.lives;
        document.querySelector('.opp-score span').textContent = joiner.score;
        document.querySelector('.opp-clicks-left').textContent = joiner.clicksLeft;
        document.querySelector('.your-clicks-left').textContent = creator.clicksLeft;

    } else {
        console.log('Error updating lives and scores');
    }


}


function changeClicksLeft(player) {



        if (player === 'creator') {

            // when we emit deductClicks event the server will update the game info in the server and
            // emit the updated game object using the event updateGameInfo
            var creatorClicksLeft = window.game.creator.clicksLeft;

            if (window.player.type === 'creator') {


                creatorClicksLeft = +creatorClicksLeft - 1;

                socket.emit('updateClicksLeft', {
                    gameId: window.game.id,
                    player,
                    deduct: true

                });


                if (creatorClicksLeft <= -1) {
                    return;
                }
                updatePlayerClicksLeft(player, creatorClicksLeft);

            } else if (window.player.type === 'joiner') {

                creatorClicksLeft = +creatorClicksLeft - 1;

                //request the updated game object without any another deduction,
                // the deduction happened when the player type is a creator
                socket.emit('updateClicksLeft', {
                    gameId: window.game.id,
                    deduct: false
                });


                if (creatorClicksLeft <= -1) {
                    return;
                }
                updatePlayerClicksLeft(player, creatorClicksLeft);

            }
        } else if (player === 'joiner') {

            // when we emit deductClicks event the server will update the game info in the server and
            // emit the updated game object using the event updateGameInfo
            var joinerClicksLeft = window.game.joinerClicksLeft;

            if (window.player.type === 'joiner') {


                console.log({joinerClicksLeft});
                joinerClicksLeft = +joinerClicksLeft - 1;

                socket.emit('updateClicksLeft', {
                    gameId: window.game.id,
                    player,
                    deduct: true

                });


                if (joinerClicksLeft <= -1) {
                    return;
                }
                updatePlayerClicksLeft(player, joinerClicksLeft);

            } else if (window.player.type === 'creator') {

                joinerClicksLeft = +joinerClicksLeft - 1;

                //request the updated game object without any another deduction,
                // the deduction happened when the player type is a creator
                socket.emit('updateClicksLeft', {
                    gameId: window.game.id,
                    deduct: false
                });


                if (joinerClicksLeft <= -1) {
                    return;
                }
                updatePlayerClicksLeft(player, joinerClicksLeft);

            }
        }


    }

function updatePlayerClicksLeft(player, updatedClicks) {
    if (player === window.player.type) {
        document.querySelector('.your-clicks-left').textContent = updatedClicks;
    } else {
        document.querySelector('.opp-clicks-left').textContent = updatedClicks;
    }


}


function onNoMoreClickLeft(game){

    const creatorScore = game.creator.score;
    const creatorName = (game.creator.name).toUpperCase();

    const joinerScore = game.joiner.score;
    const joinerName = (game.joiner.name).toUpperCase();

    var highestPlayerObject= {};
    var lowestPlayerObject = {};

    if(creatorScore > joinerScore){
        highestPlayerObject = {
            score : creatorScore ,
            name : creatorName
        };

        lowestPlayerObject = {
            score : joinerScore ,
            name : joinerName
        }




    }else if(creatorScore < joinerScore){
        lowestPlayerObject = {
            score : creatorScore ,
            name : creatorName
        };

        highestPlayerObject = {
            score : joinerScore ,
            name : joinerName
        }

    }else{
        Swal.fire({
            icon : 'info' ,
            title: 'Game Ended',
            text : `The two players have the same score : ${highestPlayerObject.score}`,
            showConfirmButton: false
        })

        socket.emit('closeGame' , {
            gameId : game.id
        })
        return null;
    }

    Swal.fire({
        icon : 'info' ,
        title: 'Game Ended',
        html: '<pre>' + `The winner:<span style="font-weight: bold"> ${highestPlayerObject.name}</span><br>Score : <span style="font-weight: bold">${highestPlayerObject.score}</span> ` + '</pre>',
        showConfirmButton: false

    })

    socket.emit('closeGame' , {
        gameId : game.id
    });

    setTimeout(function(){
        window.location.href='lobby';
    } , 5000);


}

// redirecting to lobby and delete the game if the user reload the page



// timer

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
    info: {
        color: "green"
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD
    }
};

const TIME_LIMIT = 500;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

document.getElementById("timer").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
)}</span>
</div>
`;

startTimer();

function onTimesUp() {
    clearInterval(timerInterval);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
        );
        setCircleDasharray();
        setRemainingPathColor(timeLeft);

        if (timeLeft === 0) {
            onTimesUp();
        }
    }, 1000);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(warning.color);
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}
