console.log('Script js file works');


const pageTitle = document.querySelector('title').innerHTML;

// Home Page
if (pageTitle === 'Minesweeper') {

    const squaresContainer = document.querySelector('.mines-container');

    for (i = 0; i < 100; i++) {
        var span = document.createElement('span');

        span.classList.add('square');

        squaresContainer.appendChild(span);
    }


    var squares = document.querySelectorAll('.square');

    squares.forEach((square) => {
        square.addEventListener('click', () => {
            square.classList.add('opened');
        })
    })
}

if (pageTitle === 'Minesweeper-Lobby') {

    if(localStorage.getItem('username')){
        let usernameInput = document.querySelector('#username-input');
        usernameInput.value = localStorage.getItem('username');
    }
    const goBtn = document.querySelector('.go-button');

    goBtn.addEventListener('click', (event) => {
        event.preventDefault();

        // const username = document.querySelector('#username-input').value;
        const username = {username: document.querySelector('#username-input').value}
        const checkBoxStatus = document.querySelector('#cb5');

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
                body: JSON.stringify(username),
            }).then(response => {
                if (!response.ok) {
                    if(!checkBoxStatus){
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
                        localStorage.setItem('username', username.username);
                    } else {
                        localStorage.removeItem('username');
                    }
                    Swal.fire({
                        title: `${username.username} ,Are you ready to start?`,
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
                            window.location.href = 'home';

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