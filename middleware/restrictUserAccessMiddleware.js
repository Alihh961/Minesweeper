const jwt = require('jsonwebtoken');


const accessToLoginSignupPage = (req, res ,next) => {

    const token = req.cookies.jwt;

    if(token){

        jwt.verify(token ,process.env.APP_SECRET , (err, decodedToken)=>{
            console.log(err);
            if(!err){
                res.redirect('/lobby');
            }else{
                console.log('err in accessToLoginSignupPage Middleware');
                res.cookie('jwt', '1' , {maxAge : 1});
                next();

            }
        })

    }else{
        next();

    }

};


module.exports = {accessToLoginSignupPage};