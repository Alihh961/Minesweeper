class MinesweeperGame {


    constructor() {
        this.objects = this._generateObjects();
        this.creator ;
        this.creatorScore = 0;
        this.creatorLifes = 3;
        this.player ;
        this.id = this.generateUUIDv4();
        this.removedValues = [];
    }

    _setCreator(name){
        this.creator = name;
    }

    getCreator(){
        return this.creator;
    }

    _setPlayer(name){
        this.player = name;
    }

    getPlayer(){
        return this.player;
    }

    _generateObjects() {

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

    getObjects(){
        return this.objects;
    }

    returnThenRemoveAnObject(index){


        const randomValue = this.getObjects()[index];

        this.getObjects()[index] = null;
        this.removedValues.push({value : randomValue , squareId : index});

        if(randomValue == '-'){
            this.creatorLifes -= 1;
        }else if(randomValue == '+'){

            this.creatorLifes += 1;
        }else{
            this.creatorScore += randomValue;
        }


        return randomValue;
    }

    generateUUIDv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


}


module.exports = MinesweeperGame;