class MinesweeperGame {


    constructor() {
        this.objects = this._generateObjects();
        this.removedValues = [];

        this.creator = null;
        this.joiner = null;

        this.nextClicker = 'creator';
        this.id = this._generateUUIDv4();
        this.closed = false;
    }

    addCreator(id) {
        this.creator = new Player(id, 'creator');
    }

    addJoiner(id) {
        this.joiner = new Player(id, 'joiner');
    }



    _generateObjects() {

        const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const lives = "+";
        const mines = "-";

        var arrayOfObjects = [];

        for (let i = 0; i < 7; i++) {
            arrayOfObjects = arrayOfObjects.concat(numbers);
        }

        for (let i = 0; i < 5; i++) {
            arrayOfObjects.push(lives);
        }

        for (let i = 0; i < 25; i++) {
            arrayOfObjects.push(mines);
        }

        arrayOfObjects = this._shuffleArray(arrayOfObjects);

        return arrayOfObjects;
    }

    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    _getObjects(){
        return this.objects;
    }

    returnThenRemoveAnObject(index, player) {
        const randomValue = this._getObjects()[index];

        this._getObjects()[index] = null;
        this.removedValues.push({ value: randomValue, squareId: index });

        this._updatePlayerStats(randomValue, player);
        this._updateClicksLeft(player);
        this._toggleNextClicker();

        return randomValue;
    }

    checkPlayerClicks(player){

        if(player === 'creator'){
            console.log(this.creator.clicksLeft);

            return this.creator.clicksLeft;

        }else if(player === 'joiner'){
            return this.joiner.clicksLeft;

        }
        return false;
    }

    _updatePlayerStats(value, player) {
        if (value === '-') {
            player === 'creator' ? this.creator.deductLife() : this.joiner.deductLife();
        } else if (value === '+') {
            player === 'creator' ? this.creator.addLife() : this.joiner.addLife();
        } else {
            player === 'creator' ? this.creator.adjustScore(+value) : this.joiner.adjustScore(+value);
        }
    }

    _updateClicksLeft(player) {
        player === 'creator' ? this.creator.adjustClicksLeft() : this.joiner.adjustClicksLeft();
    }

    _toggleNextClicker() {
        this.nextClicker = this.nextClicker === 'joiner' ? 'creator' : 'joiner';
    }

    _generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };



}


module.exports = MinesweeperGame;