const bcrypt = require('bcryptjs');

function hashAString(string){
    bcrypt.hash(string , 12, (err, hashedString) => {
        if (err) {
            // Handle error
            return;
        }

    return hashedString;
    });
}

module.exports = { hashAString };