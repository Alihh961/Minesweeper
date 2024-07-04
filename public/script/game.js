// i must solve the problem on refresh it shows that i won while it must check who refreshed the page and show dif msgs
let socket = io();

document.body.style.overflow = 'hidden';


const creator = document.querySelector("input[name='creator']").value;
const joiner = document.querySelector("input[name='joiner']").value;
const gameId = document.querySelector("input[name='gameId']").value;
const loggedUser = document.querySelector("input[name='loggedUser']").value;


if (creator) {
    socket.emit('createAGame', {
        creator: creator,
        jwt: getCookie('jwt')
    });
    // document.body.style.pointerEvents = 'none';
    document.body.classList.add('game-not-started');
} else if (joiner) {
    socket.emit('join', {joiner: loggedUser, gameId: gameId, jwt: getCookie('jwt')});
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

    window.gameId = data.game.id;

});

// starting the game
socket.on('gameJoinedSuccessfully', function (data) {

    // document.body.style.pointerEvents = 'auto';
    document.body.classList.remove('game-not-started');
    if(document.querySelector('.msg-game-not-started')){
        document.querySelector('.msg-game-not-started').remove();

    }


    window.gameId = data.gameId;

    const msgCreatorClickFirst = document.querySelector('.game-main-section .msg-creator-start-first');

    msgCreatorClickFirst.classList.add('fadeOut');
    setTimeout(function(){
        if(msgCreatorClickFirst){
            msgCreatorClickFirst.remove();

        }
    },5000);


    const squaresContainer = document.querySelector('.mines-container');

    for (let i = 0; i < 100; i++) {
        var span = document.createElement('button');

        span.classList.add('square');
        span.setAttribute('data-square', `${i}`);

        squaresContainer.appendChild(span);
    }

    socket.emit('askingForPlayersInfoToUpdateOnScreen', {
        gameId: window.gameId
    })


    var squares = document.querySelectorAll('.square');
    if (squares) {
        squares.forEach((square) => {
            square.addEventListener('click', (event) => {
                handleClickEvent();
            });

            function handleClickEvent(){
                let clickedSquare = event.target;
                let squareId = clickedSquare.getAttribute('data-square');



                // Emit the squareClicked event to the server
                socket.emit('squareClicked', {
                    message: 'A square was clicked!',
                    squareId,
                    gameId: window.gameId,
                    jwt: getCookie('jwt')

                });
            }


        });
    }


});


socket.on('toggleTurnOnScreen', function (data) {

    const containers = document.querySelectorAll('.players-info-container');

    if (data.turn === 'mine') {
        containers[1].classList.add('his-turn');
        containers[0].classList.remove('his-turn');

    } else if (data.turn === 'his') {

        containers[0].classList.add('his-turn');
        containers[1].classList.remove('his-turn');

    }
})

socket.on('errorCreatingGame', function (error) {
    Swal.fire({
        icon: "error",
        text: "A game already running for " + loggedUser,
    }).then(() => {
        window.location.href = 'lobby'
    });
})

socket.on('notYourClick', function (data) {
    Swal.fire({
        icon: "error",
        title: "Wait",
        text: "It is not your turn yet!"
    })
});

socket.on('receiveSquareContent', function (data) {


    let clickedSquare = document.querySelector(`[data-square="${data.squareId}"]`);
    let value = data.value;

    if (clickedSquare && !clickedSquare.classList.contains('opened')) {

        if (typeof (value) === "number") {
            clickedSquare.innerHTML = data.value;
            clickedSquare.classList.add('opened');


        } else if (value === "-") {
            clickedSquare.classList.add('mine');
            clickedSquare.innerHTML = "\u26CC";
            clickedSquare.classList.add('opened');

        } else if (value === "+") {

            clickedSquare.classList.add('heart');
            clickedSquare.innerHTML = "\u2665";
            clickedSquare.classList.add('opened');


        } else {
            console.error("Error while adding content to a square")
        }

        // adding red color for squares click by opp
        if (data.cssClass) {
            clickedSquare.classList.add(data.cssClass);
        }

        socket.emit('askingForPlayersInfoToUpdateOnScreen', {
            gameId: window.gameId
        })

    } else {
        socket.emit('closeGame', {
            gameId: window.gameId
        });

        Swal.fire({
            icon: "error",
            title: 'Error',
            text: 'Something went wrong!'
        }).then(function () {
            window.location.href = '/lobby';
        })

    }
});

// when there is no clicks this event will be executed 2 seconds after the last click
socket.on('noClicksLeft', function (data) {

    onNoMoreClickLeft(data.message);

});

socket.on('noMoreLivesForOpp', function (data) {

    Swal.fire({
        title: 'Congratulations!',
        text: 'You have won, Your opponent has no more lives',
        icon: 'success',
        showConfirmButton: false
    });

    socket.emit('closeGame', {
        gameId: data.gameId
    })

    setTimeout(function () {
        window.location.href = 'lobby';

    }, 2500);


});

socket.on('noMoreLivesForYou', function (data) {

    Swal.fire({
        title: 'Sorry, out of lives',
        text: 'You have lost the game!',
        icon: 'error',
        showConfirmButton: false
    });

    socket.emit('closeGame', {
        gameId: data.gameId
    })

    setTimeout(function () {
        window.location.href = 'lobby';

    }, 2500);
})

window.addEventListener('beforeunload', () => {
    if (window.gameId) {
        socket.emit('closeGame', {
            gameId: window.gameId,
            message: 'close the game of id ' + window.gameId,
            jwt: getCookie('jwt'),
            refreshed: true
        });
    }

});

window.addEventListener('pagehide', () => {
    if (window.gameId) {
        socket.emit('closeGame', {
            gameId: window.gameId,
            message: 'close the game of id ' + window.gameId,
            jwt: getCookie('jwt'),
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
    window.gameId = data.gameId
});

// show won message when the opponent leaves the game
socket.on('gameIsClosed', function (data) {

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


});

socket.on('ranOfClicks', function (data) {
    Swal.fire({
        icon: 'info',
        title: 'Game Ended',
        text: 'Game ended for running out of clicks'
    })
})

socket.on('updatePlayersInfoOnScreen', function (data) {

    if (data.yourInfo && data.oppInfo) {
        updatePlayersInfoOnScreen(data);
    }


});


function updatePlayersInfoOnScreen(info) {

    const yourInfo = info.yourInfo;
    const oppInfo = info.oppInfo;

    document.querySelector('.your-lives span').textContent = yourInfo.lives;
    document.querySelector('.your-score span').textContent = yourInfo.score;
    document.querySelector('.your-clicks-left').textContent = yourInfo.clicksLeft;
    document.querySelector('.opp-lives span').textContent = oppInfo.lives;
    document.querySelector('.opp-score span').textContent = oppInfo.score;
    document.querySelector('.opp-clicks-left').textContent = oppInfo.clicksLeft;


}

function onNoMoreClickLeft(message) {

    Swal.fire({
        icon: message.icon,
        title: message.title,
        html: message.html,
        showConfirmButton: false
    })

    setTimeout(function () {
        window.location.href = 'lobby';
    }, 3000)


}

function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
        let split = el.split('=');
        cookie[split[0].trim()] = split.slice(1).join("=");
    })
    return cookie[name];
}


// redirecting to lobby and delete the game if the user reload the page



