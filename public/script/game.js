// i must solve the problem on refresh it shows that i won while it must check who refreshed the page and show dif msgs
let socket = io();

const creator = document.querySelector("input[name='creator']").value;
const joiner = document.querySelector("input[name='joiner']").value;
const gameId = document.querySelector("input[name='gameId']").value;
const loggedUser = document.querySelector("input[name='loggedUser']").value;
const hashedPlayerType = document.querySelector("input[name='hashedPlayerType']").value;

window.hashedPlayerType = hashedPlayerType;

if (creator) {
    socket.emit('createAGame', {creator: creator});
    window.creator = true;
    window.joiner = false;

} else if (joiner) {
    socket.emit('join', {joiner: loggedUser, gameId: gameId});
    window.creator = false;
    window.joiner = true;
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
    console.log(data.game.id);
    window.gameId = data.game.id;
});
socket.on('gameJoinedSuccessfully', function (data) {
    window.gameId = data.gameId;
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


        });
    });
}

socket.on('receiveSquareContent', function (data) {


    const creatorLives = data.currentGame.creatorLives;
    const joinerLives = data.currentGame.joinerLives;


    if (creatorLives == 0 || joinerLives == 0) {

        socket.emit('closeGame', {
            gameId: window.gameId ,
            noMoreLives : 1
        });

        if (creatorLives == 0) {
            if (window.joiner) {
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


            } else if (window.creator) {
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

        } else if (joinerLives == 0) {
            if (window.creator) {
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


            } else if (window.joiner) {
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
            console.log(value);
            console.log("error")
        }


    }
});


window.addEventListener('beforeunload', () => {
    if (window.gameId) {
        socket.emit('closeGame', {
            gameId: window.gameId,
            message: 'close the game of id ' + window.gameId
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
})


// redirecting to lobby and delete the game if the user reload the page
