console.log('Script js file works');

let btn = document.createElement('button');
btn.innerText  = 'click to send';
document.body.appendChild(btn);

const pageTitle = document.querySelector('title').innerHTML;

// Game Page
if (pageTitle === 'Minesweeper-Game') {

    // Socket

    let socket = io();

    socket.on('connect', () => {
        console.log('Connected to the server')
    });

    socket.on('disconnect', () => {
        console.log('disconnected from the server');
    });
    socket.emit('sendMessageToAllUsers',{from : 'Ali', text: 'Hello MotherFuckers'});

    socket.on('newMessage' , (data)=>{
        console.log(data);
    });

    socket.on('newUserConnected' , (data)=>{

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

    })


    btn.onclick = ()=>{

        socket.emit('sendMessageToAllUsers' , {
            text : 'Message sent to all users'
        });

    }


    const squaresContainer = document.querySelector('.mines-container');

    for (let i = 0; i < 100; i++) {
        var span = document.createElement('span');

        span.classList.add('square');
        span.setAttribute('data-square' , `${i}`);

        squaresContainer.appendChild(span);
    }


    var squares = document.querySelectorAll('.square');




    squares.forEach((square) => {
        square.addEventListener('click', (event) => {
            let clickedSquare = event.target;
            let id = clickedSquare.getAttribute('data-square');
            // Emit the squareClicked event to the server
            socket.emit('squareClicked', {
                message: 'A square was clicked!' ,
                id
            });

            // Add the 'opened' class to the clicked square
            clickedSquare.classList.add('opened');

        });
    });


    socket.on('receiveSquareContent', function(data) {

        let clickedSquare = document.querySelector(`[data-square="${data.id}"]`);
        let value = data.value;

        if(clickedSquare){
           if(typeof(value) === "number"){
               clickedSquare.innerHTML = data.value;

           }else if(value === "-"){
               clickedSquare.classList.add('mine');
               clickedSquare.innerHTML = "\u26CC";

           }else if(value === "+"){
               clickedSquare.classList.add('heart');
               clickedSquare.innerHTML = "\u2665";

           }else{
               console.log("error")
           }

        }
    });




}

// Home Page
if (pageTitle === 'Minesweeper-Home') {

    if (localStorage.getItem('username')) {
        let usernameInput = document.querySelector('#username-input');
        usernameInput.value = localStorage.getItem('username');
    }


    const goBtn = document.querySelector('.go-button');

    goBtn.addEventListener('click', (event) => {
        event.preventDefault();

        // const username = document.querySelector('#username-input').value;
        const username = document.querySelector('#username-input').value;
        const password = document.querySelector('#password-input').value;
        const confirmedPassword = document.querySelector('#confirmPassword-input').value;
        const email = document.querySelector('#email-input').value;

        // const checkBoxStatus  = document.querySelector('#cb5').checked;
        const checkBoxStatus = false;



        if (!username) {
            Swal.fire({
                icon: "error",
                text: "Username can't be empty",
            });
        } else {
            const url = `user/check-username`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username ,
                    email ,
                    password,
                    confirmedPassword,
                    save : checkBoxStatus
                }),
            }).then(response => {
                if (!response.ok) {
                    // localStorage.removeItem('username');
                    if (!checkBoxStatus) {

                        localStorage.removeItem('username');

                    }
                    // Handle error response
                    if (response.status == 409) {
                        throw new Error('User already exists');
                    } else {
                        throw new Error('Unknown error , try again later');
                    }
                }
                // If response is OK, return the response JSON data
                return response.json();
            }).then(data => {
                // Display message based on the response data or status
                if (data.status === 201) {
                    if (checkBoxStatus) {
                        localStorage.setItem('username', username);
                    } else {
                        localStorage.removeItem('username');
                    }
                    Swal.fire({
                        title: `${username} ,Are you ready to start?`,
                        icon: 'success',
                        showConfirmButton: true,
                        confirmButtonText: "Lets Go!",
                        confirmButtonColor: '#3085d6',

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
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'lobby';

                        }
                    });
                } else if (data.status === 409) {
                    if (!checkBoxStatus) {
                        localStorage.removeItem('username');

                    }
                    ;
                    Swal.fire({
                        icon: "error",
                        text: "Username exists already",
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        text: "Unknown response status",
                    });
                }
            })
                .catch(error => {
                    Swal.fire({
                        icon: "error",
                        text: error.message,
                    });
                })

        }
    })
}

// Lobby Page
if(pageTitle === 'Minesweeper-Lobby'){
    let createGameBtn = document.querySelector('.create-game-btn');


}