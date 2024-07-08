let socket = io();
const loggedUser = document.querySelector("input[name='loggedUser']").value;
const gamesListContainer = document.querySelector('.games-list');

let allGames;
let searchQuery = window.location.search.substring(1);
if(searchQuery){
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
    if(params.err === 'n'){
        Swal.fire({
            title : 'Error',
            icon : 'error',
            text : "You can't join your game"
        })
    }else if(params.err === 'x'){
        Swal.fire({
            title : 'Error',
            icon : 'error',
            text : "No game founded"
        })
    }
}


// empty the search query
if (performance.navigation.type === 1) {
    window.location.href = '/lobby';
}


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

socket.emit('getAllGames');

socket.on('receivingAllGames', (data) => {

    allGames = data.games;
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
            form.setAttribute('action', '/checkGame');
            form.classList.add('form-join');

            const inputUser = document.createElement('input');
            inputUser.setAttribute('type', 'hidden');
            inputUser.setAttribute('name', 'joiner');
            inputUser.setAttribute('value', loggedUser);

            const inputGameId = document.createElement('input');
            inputGameId.setAttribute('type', 'hidden');
            inputGameId.setAttribute('name', 'gameId');
            inputGameId.setAttribute('value', game.id);

            const inputGameName = document.createElement('input');
            inputGameName.setAttribute('type', 'hidden');
            inputGameName.setAttribute('name', 'gameName');
            inputGameName.setAttribute('value', game.name);



            const button = document.createElement('button');
            button.setAttribute('type', 'submit');
            button.innerText = `${game.name} - Game`;
            button.setAttribute('id' , game.id);
            button.classList.add('game-join-button');

            if(game.closed){
                button.classList.add('closed');

            }

            form.appendChild(inputUser);
            form.appendChild(inputGameId);
            form.appendChild(inputGameName);
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

function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function(el) {
        let split = el.split('=');
        cookie[split[0].trim()] = split.slice(1).join("=");
    })
    return cookie[name];
}








