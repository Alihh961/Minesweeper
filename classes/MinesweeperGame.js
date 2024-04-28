class MinesweeperGame {

    constructor() {
        this.objects = this.generateObjects();
    }

    generateObjects() {

        const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const lifes = "+";
        const mines = "-";

        var arrayOfObjects = [];

        for (let i = 0; i < 7; i++) {
            arrayOfObjects = arrayOfObjects.concat(numbers);
        }

        for (let i = 0; i < 5; i++) {
            arrayOfObjects.push(lifes);
        }

        for (let i = 0; i < 25; i++) {
            arrayOfObjects.push(mines);
        }

        arrayOfObjects = this.shuffleArray(arrayOfObjects);

        return arrayOfObjects;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

}


module.exports = MinesweeperGame;