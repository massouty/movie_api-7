const { Passport } = require('passport');

const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Models = require('/models.js'),
passportJWT = require('passport-jwt');

let Users = Models.user,
JWTStratagey = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJWT;

passport.use(new LocalStrategy ({
    usernameField :'username',
    passwordField : 'password'
}, (username,password,callback) =>{
    console.log('username'+ ' ' + 'password');
    Users.findOne({Username : username},(error,user) => {
        if(error){
            console.log(error);
            return callback(error);
        }
        if(!user){
            console.log('incorrect username or password');
            return callback(null,false,{message:'incorrect username and password'});
     
        }
                console.log('finished');
                return callback (null, user);
            });
}));

passport.use(new JWTStratagey({
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'},
    (jwtPayload , callback) => {
        return Users.findById(jwtPayload._id)
        .then((user)=> {
            return callback (null,user);
        })
        .catch((error) => {
            return callback (error)
        });
    }));

