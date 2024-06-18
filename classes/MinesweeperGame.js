class MinesweeperGame {


    constructor() {
        this.objects = this._generateObjects();
        this.creator ;
        this.creatorScore = 0;
        this.creatorLives = 3;
        this.creatorTime = 200;
        this.joiner ;
        this.joinerScore = 0;
        this.joinerLives = 3;
        this.joinerTime = 200;
        this.id = this.generateUUIDv4();
        this.removedValues = [];
        this.closed = false;
    }

    setCreator(name){
        this.creator = name;
    }

    getCreator(){
        return this.creator;
    }

    setJoiner(name){
        this.joiner = name;
    }

    getJoiner(){
        return this.joiner;
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

    getObjects(){
        return this.objects;
    }

    returnThenRemoveAnObject(index , player){


        const randomValue = this.getObjects()[index];

        this.getObjects()[index] = null;
        this.removedValues.push({value : randomValue , squareId : index});

        if(randomValue == '-'){

            if(player === 'creator'){
                this.creatorLives -= 1;

            }else{
                this.joinerLives -= 1;

            }
        }else if(randomValue == '+'){

            if(player === 'creator'){
                this.creatorLives += 1;

            }else{
                this.joinerLives += 1;

            }
        }else{
            if(player === 'creator'){
                this.creatorScore += randomValue;

            }else{
                this.joinerScore += randomValue;

            }
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