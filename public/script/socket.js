const pageTitle2 = document.querySelector('title').innerHTML;

console.log('socket.js file works');
let socket = io();

// Game Page
if (pageTitle2 === 'Minesweeper-Game') {

// Socket


    // btn.onclick = ()=>{
    //
    //     socket.emit('sendMessageToAllUsers' , {
    //         text : 'Message sent to all users'
    //     });
    //
    // }


    const gameId = document.querySelector('.game-id-hidden').value;


    socket.emit('getGameById', {
        id: gameId
    });

    socket.on('setGameById', (data) => {
        window.game = data.game;
    })

    socket.on('connect', () => {
    });

    socket.on('disconnect', () => {
        console.log('disconnected from the server');
    });

    window.addEventListener('beforeunload', () => {
        socket.emit('closeGame');
    });

    socket.emit('sendMessageToAllUsers', {from: 'Ali', text: 'Hello All'});


    socket.on('newUserConnected', (data) => {

        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "info",
            title: data.message
        });

    });


    var squares = document.querySelectorAll('.square');
    if(squares){
        squares.forEach((square) => {
            square.addEventListener('click', (event) => {
                let clickedSquare = event.target;
                let squareId = clickedSquare.getAttribute('data-square');
                // Emit the squareClicked event to the server
                socket.emit('squareClicked', {
                    message: 'A square was clicked!',
                    squareId,
                    gameId: window.game.id

                });

                // Add the 'opened' class to the clicked square
                clickedSquare.classList.add('opened');

            });
        });
    }

    socket.on('receiveSquareContent', function (data) {

        let clickedSquare = document.querySelector(`[data-square="${data.squareId}"]`);
        let value = data.value;

        if (clickedSquare) {

            if (typeof (value) === "number") {
                clickedSquare.innerHTML = data.value;

            } else if (value === "-") {
                clickedSquare.classList.add('mine');
                clickedSquare.innerHTML = "\u26CC";

            } else if (value === "+") {
                clickedSquare.classList.add('heart');
                clickedSquare.innerHTML = "\u2665";

            } else {
                console.log("error")
            }

        }
    });


}



const gamesListContainer = document.querySelector('.games-list');

socket.emit('getAllGames', {}
);

socket.on('receivingAllGames', (data) => {
    const games = data.games;
    if (gamesListContainer) {

        if (games && games.length > 0) {
            updateGamesList(games, gamesListContainer);

        } else {
            updateGamesList(null, null);
        }
    }


});


function updateGamesList(games, gamesListContainer) {

    if (games && games.length > 0) {
        games.forEach(game => {
            console.log(game);
            const form = document.createElement('form');
            form.setAttribute('method', 'GET');
            form.setAttribute('action', 'game-join');
            form.classList.add('form-join');

            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', 'gameId');

            input.setAttribute('value', game.id);

            const button = document.createElement('button');
            button.setAttribute('type', 'submit');
            button.innerText = `${game.creator}'s game`;
            button.setAttribute('id', game.id);
            button.classList.add('game-join-button');

            form.appendChild(button);

            gamesListContainer.appendChild(form);


        })
    } else {

        let message = document.createElement('h4');
        message.textContent = 'No games to show';
        message.classList.add('form-join');

        gamesListContainer.appendChild(message);
    }
}