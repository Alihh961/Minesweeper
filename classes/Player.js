class Player{
    constructor(id , type , name , jwt) {

        this.id = id;
        this.type = type;
        this.name = name;
        this.score = 0;
        this.lives = 5;
        this.clicksLeft = 15;
        this.jwt = jwt;
    }

    addLife() {
        this.lives++;
    }

    deductLife(){
        this.lives--;
    }

    adjustScore(amount) {
        this.score += amount;
    }

    adjustClicksLeft() {
        this.clicksLeft--;
    }


}

module .exports =  Player;