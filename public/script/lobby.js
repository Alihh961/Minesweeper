let socket = io();
const loggedUser = document.querySelector("input[name='loggedUser']").value;
const gamesListContainer = document.querySelector('.games-list');
let allGames;

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


document.querySelector('.add-timer').addEventListener('click' ,()=>{

    if(document.querySelector('#timer')){
        document.querySelector('#timer').remove();
        onTimesUp();
    }
})


function addTimer(){
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

    const TIME_LIMIT = 20;
    let timePassed = 0;
    let timeLeft = TIME_LIMIT;
    let timerInterval = null;
    let remainingPathColor = COLOR_CODES.info.color;
    let div = document.createElement('div');
    div.setAttribute('id' , 'timer');
    div.innerHTML = `
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

    document.body.append(div);

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

};

addTimer();








