console.log('Script js file works');



const pageTitle = document.querySelector('title').innerHTML;

console.log(pageTitle);
// Game Page
if (pageTitle === 'Minesweeper-Game') {









}

// Home Page
if (pageTitle === 'Minesweeper-Home') {

    if (localStorage.getItem('username')) {
        let usernameInput = document.querySelector('#username-input');
        usernameInput.value = localStorage.getItem('username');
    }


    const goBtn = document.querySelector('.go-button');


    // inscription form button
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
            const url = `user/signup`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmedPassword,
                    save: checkBoxStatus
                }),
            }).then(response => {
                if (!response.ok) {
                    // localStorage.removeItem('username');
                    if (!checkBoxStatus) {

                        localStorage.removeItem('username');

                    }
                    console.log(response);

                }


                // If response is OK, return the response JSON data
                return response.json();
            }).then(data => {
                // Display message based on the response data or status
                if (data.status === 201) {
                    if (checkBoxStatus) {
                        localStorage.setItem('username', username);
                        window.userName = username;
                    } else {
                        localStorage.removeItem('username');
                    }
                    Swal.fire({
                        title: `Welcome ${username}, You can login now!`,
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
                            window.location.href = '/lobby';
                        }
                    });
                } else if (data.code === 409 || 400) {

                    if (!checkBoxStatus) {
                        localStorage.removeItem('username');

                    }
                    ;
                    Swal.fire({
                        icon: "error",
                        text: data.message,
                    });
                } else {


                    Swal.fire({
                        icon: "error",
                        text: "Unknown response status",
                    });
                }
            })
                .catch(error => {
                    console.log(error);
                    Swal.fire({
                        icon: "error",
                        text: error.message,
                    });
                })

        }
    });


    const loginBtn = document.querySelector('.login-button');

    //login button
    loginBtn.addEventListener('click', function (event)  {

        event.preventDefault();

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const url = 'user/login';
        fetch(url , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({

                email,
                password,

            }),
        })
            .then((response)=>{
                if(!response.ok){
                    console.log(error);
                }

                return response.json();
            })
            .then(data=>{
                console.log(data.statusCode);
                if(data.statusCode  === 401 || data.statusCode === 400){
                    Swal.fire({
                        icon : "error" ,
                        title : data.message,
                    })
                }else if(data.statusCode == 200){
                    Swal.fire( {
                        icon :'success' ,
                        title : 'Welcome' ,
                        text : `${data.userName}, ready to go?`,
                        showConfirmButton : true ,

                    }).then(
                        (result)=>{
                            result.isConfirmed ? window.location.href = '/lobby' : null;
                        }
                    )

                    console.log(data);
                }else{
                    Swal.fire({
                        icon :'error',
                        title : 'Unknown Error',
                        text : 'Try again later'
                    });
                }

            })
            .catch(error=>{
                console.log(error);
            })

    });


    // guest form button
    const guestBtn = document.querySelector('.guest-button');

    guestBtn.addEventListener('click' , function (event){

        event.preventDefault();

        const url = 'user/guest-login';

        fetch(url , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((response)=>{
                if(!response.ok){
                    console.log(error);
                }

                return response.json();
            })
            .then(data=>{


                if(data.statusCode  === 401 || data.statusCode === 400){
                    Swal.fire({
                        icon : "error" ,
                        title : data.message,
                    })
                }else if(data.statusCode === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Welcome',
                        text: `${data.userName}, ready to go?`,
                        showConfirmButton: true,

                    }).then(
                        (result) => {
                            result.isConfirmed ? window.location.href = '/lobby' : null;
                        }
                    )


                }else{
                    Swal.fire({
                        icon :'error',
                        title : 'Unknown Error',
                        text : 'Try again later'
                    });
                }

            })
            .catch(error=>{
                console.log(error);
            })
    })



}

// Lobby Page
if (pageTitle === 'Minesweeper-Lobby') {
    let createGameBtn = document.querySelector('.create-game-btn');


}