let socket = io();

let searchQuery = window.location.search.substring(1);
let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g, '":"') + '"}');

if (params.creator) {
    socket.emit('createAGame', {creator: params.creator});
}else if(params.joiner){
    socket.emit('join' , { joiner : params.joiner , gameId : params.gameId});
}else{
    window.location.href='/lobby';
}
let bttn = document.querySelector('.hoho');

bttn.addEventListener('click' , ()=>{

        console.log('hoh is clicked');
        socket.emit('test', { id : window.gameId});

    }
);

socket.on('message', (message) => {
    console.log('Received message:', message);
});

socket.on('gameCreatedSuccessfully', function(data){
    console.log(data.game.id);
    window.gameId = data.game.id;
});
socket.on('gameJoinedSuccessfully' , function(data){
    window.gameId = data.gameId;
})
socket.on('errorCreatingGame', (error)=>{
    window.alert(error.message);
    window.location.href='/lobby';
})


var squares = document.querySelectorAll('.square');
if (squares) {
    squares.forEach((square) => {
        square.addEventListener('click', (event) => {
            let clickedSquare = event.target;
            let squareId = clickedSquare.getAttribute('data-square');
            // Emit the squareClicked event to the server
            socket.emit('squareClicked', {
                message: 'A square was clicked!',
                squareId,
                gameId: window.gameId

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
            console.log(value);
            console.log("error")
        }

    }
});


window.addEventListener('beforeunload', () => {
    socket.emit('closeGame');
});


const gameId = document.querySelector('.game-id-hidden') ? document.querySelector('.game-id-hidden') : null;

if (gameId) {
    socket.emit('getGameById', {
        id: gameId
    });

}


socket.on('setGameById', (data) => {
    window.game = data.game;
});
