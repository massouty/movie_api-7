const mongoose = require ("mongoose");
let movieSchema = mongoose.Schema({Title:{type:String , required:true},
Description:{type:String , required:true},
Genre:{
    Name:String,
    Description:String
},
Director:{
    Name:String,
    Bio:String
},
ImagePath:String,
Featured:Boolean
});

let userSchema = mongoose.Schema({userName:{type:String, required:true},
password:{type:String , required:true},
email:{type:String,required:true},
Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;

requireStack : ['./passport.js','./auth.js','/index.js'];