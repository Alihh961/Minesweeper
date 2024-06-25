class Player{
    constructor(id , type , name) {

        this.id = id;
        this.type = type;
        this.name = name;
        this.score = 0;
        this.lives = 3;
        this.clicksLeft = 10;
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