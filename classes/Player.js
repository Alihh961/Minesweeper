class Player{
    constructor(id , type , name , jwt) {

        this.id = id;
        this.type = type;
        this.name = name;
        this.score = 0;
        this.lives = 20;
        this.clicksLeft = 3;
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