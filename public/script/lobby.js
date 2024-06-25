let socket = io();
const loggedUser = document.querySelector("input[name='loggedUser']").value;
const gamesListContainer = document.querySelector('.games-list');
let allGames;
document.querySelector('.coucou').addEventListener('click' , ()=>{
    socket.emit('allGames');
})

const gameId = document.querySelector('.game-id-hidden') ? document.querySelector('.game-id-hidden') : null;

if (gameId) {
    socket.emit('getGameById', {
        id: gameId
    });

}

socket.on('connect', () => {
});


socket.on('disconnect', () => {
    console.log('disconnected from the server');
});



socket.emit('getAllGames', {

    }
);

socket.on('receivingAllGames', (data) => {
    allGames = data.games;
    console.log({gamesData : data});
    if (gamesListContainer) {

        if (allGames && allGames.length > 0) {
            updateGamesList(allGames, gamesListContainer);

        } else {
            updateGamesList(null, gamesListContainer);
        }
    }


});


function updateGamesList(games, gamesListContainer) {

    if (games && games.length > 0) {
        gamesListContainer.innerHTML = '';
        games.forEach(game => {
            const form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', 'game');
            form.classList.add('form-join');

            const inputUser = document.createElement('input');
            inputUser.setAttribute('type', 'hidden');
            inputUser.setAttribute('name', 'joiner');
            inputUser.setAttribute('value', loggedUser);

            const inputGameId = document.createElement('input');
            inputGameId.setAttribute('type', 'hidden');
            inputGameId.setAttribute('name', 'gameId');
            inputGameId.setAttribute('value', game.id);


            const button = document.createElement('button');
            button.setAttribute('type', 'submit');
            button.innerText = `${game.creator.name}'s game`;
            button.classList.add('game-join-button');

            if(game.closed){
                button.classList.add('closed');

            }

            form.appendChild(inputUser);
            form.appendChild(inputGameId);
            form.appendChild(button);


            gamesListContainer.appendChild(form);


        })
    } else {
        gamesListContainer.innerHTML = '';

        let message = document.createElement('h4');
        message.textContent = 'No games to show';
        message.classList.add('form-join');

        gamesListContainer.appendChild(message);

    }
}

// joining a game







