console.log('Script js file works');

const pageTitle = document.querySelector('title').innerHTML;

// Home Page
if(pageTitle === 'Minesweeper'){

    const squaresContainer = document.querySelector('.mines-container');

    for(i=0 ; i < 20 *20 ; i++){
        var span = document.createElement('span');

        span.classList.add('square');

        squaresContainer.appendChild(span);
    }


    var squares  = document.querySelectorAll('.square');

    console.log(squares);
    squares.forEach((square)=>{
        square.addEventListener('click' , ()=>{ square.classList.add('opened');
        })
    })
}