class Player{
    constructor(id , type , name) {

        this.id = id;
        this.type = type;
        this.name = name;
        this.score = 0;
        this.lives = 2;
        this.clicksLeft = 20;

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