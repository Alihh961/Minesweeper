// i must solve the problem on refresh it shows that i won while it must check who refreshed the page and show dif msgs
let socket = io();

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

    window.gameId = data.game.id;
    window.game = data.game;
    updatePlayersInfo(data.game);
});
socket.on('gameJoinedSuccessfully', function (data) {
    window.gameId = data.game.id;
    updatePlayersInfo(data.game);
});

socket.on('errorCreatingGame', (error) => {
    Swal.fire({
        icon: "error",
        text: "A game already running for " + loggedUser,
    }).then(() => {
        window.location.href = 'lobby'
    });
})


var squares = document.querySelectorAll('.square');
if (squares) {
    squares.forEach((square) => {
        square.addEventListener('click', (event) => {
            let clickedSquare = event.target;
            let squareId = clickedSquare.getAttribute('data-square');

            clickedSquare.classList.add('opened');
            // Emit the squareClicked event to the server
            socket.emit('squareClicked', {
                message: 'A square was clicked!',
                squareId,
                gameId: window.gameId,
                hashedPlayerType

            });

            changeClicksLeft(window.player.type);


        });
    });
}

socket.on('receiveSquareContent', function (data) {




    const creatorLives = data.currentGame.creatorLives;
    const joinerLives = data.currentGame.joinerLives;


    if (creatorLives === 0 || joinerLives === 0) {

        socket.emit('closeGame', {
            gameId: window.gameId,
            noMoreLives: 1
        });

        if (creatorLives === 0) {
            if (window.player.type === 'joiner') {
                Swal.fire({
                    title: 'Congratulation ,You have won',
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


            } else if (window.player.type === 'creator') {
                Swal.fire({
                    title: 'Ops, You have lost',
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

        } else if (joinerLives === 0) {
            if (window.player.type === 'creator') {
                Swal.fire({
                    title: 'Congratulation ,You have won',
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


            } else if (window.player.type === 'joiner') {
                Swal.fire({
                    title: 'Ops, You have lost',
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

        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred"
            }).then(function () {
                window.location.href = '/lobby';
            })
        }
    }


    let clickedSquare = document.querySelector(`[data-square="${data.squareId}"]`);
    let value = data.value;

    if (clickedSquare) {

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


    }
    updatePlayersInfo(data.currentGame);
});


window.addEventListener('beforeunload', () => {
    if (window.gameId) {
        let player = window.player.type;
        socket.emit('closeGame', {
            gameId: window.gameId,
            message: 'close the game of id ' + window.gameId,
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

socket.on('ranOfClicks')


function updatePlayersInfo(game) {
    const creatorLives = game.creatorLives;
    const joinerLives = game.joinerLives;
    const creatorScore = game.creatorScore;
    const joinerScore = game.joinerScore;
    const creatorClicksLeft = game.creatorClicksLeft;
    const joinerClicksLeft = game.joinerClicksLeft;


    if (window.player.type === 'joiner') {
        document.querySelector('.your-lives span').textContent = joinerLives;
        document.querySelector('.your-score span').textContent = joinerScore;
        document.querySelector('.opp-lives span').textContent = creatorLives;
        document.querySelector('.opp-score span').textContent = creatorScore;
        document.querySelector('.opp-clicks-left').textContent = creatorClicksLeft;
        document.querySelector('.your-clicks-left').textContent = joinerClicksLeft;


    } else if (window.player.type === 'creator') {

        document.querySelector('.your-lives span').textContent = creatorLives;
        document.querySelector('.your-score span').textContent = creatorScore;
        document.querySelector('.opp-lives span').textContent = joinerLives;
        document.querySelector('.opp-score span').textContent = joinerScore;
        document.querySelector('.opp-clicks-left').textContent = joinerClicksLeft;
        document.querySelector('.your-clicks-left').textContent = creatorClicksLeft;

    } else {
        console.log('Error updating lives and scores');
    }


}


function changeClicksLeft(player) {



        if (player === 'creator') {

            // when we emit deductClicks event the server will update the game info in the server and
            // emit the updated game object using the event updateGameInfo
            var creatorClicksLeft = window.game.creatorClicksLeft;

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


// redirecting to lobby and delete the game if the user reload the page
