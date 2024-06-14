let socket = io();



const gameId = document.querySelector('.game-id-hidden') ? document.querySelector('.game-id-hidden') : null;

if(gameId){
    socket.emit('getGameById', {
        id: gameId
    });

}

socket.on('connect', () => {
});

socket.on('disconnect', () => {
    console.log('disconnected from the server');
});






const gamesListContainer = document.querySelector('.games-list');

socket.emit('getAllGames', {}
);

socket.on('receivingAllGames', (data) => {
    const games = data.games;
    if (gamesListContainer) {

        if (games && games.length > 0) {
            updateGamesList(games, gamesListContainer);

        } else {
            updateGamesList(null, gamesListContainer);
        }
    }


});


function updateGamesList(games, gamesListContainer) {

    if (games && games.length > 0) {
        games.forEach(game => {
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