
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const Models = require('./models.js');

// Configure Express Module
const app = express();

// Configure Mongoose Module
const Movies = Models.Movie;
const Users = Models.User;

// const URI = 'mongodb://localhost:27017/myFlixDB'; // Database Option 1: Local DB
const URI = process.env.myFlixDB; // Database Option 2: Hosted DB

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
 

// Configure logging file access
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
});

// Configure Allowed Domains for Cross-Origin Resource Sharing (CORS)
const allowedOrigins = ['http://localhost:8080', 'http://localhost:1234'];

// Configure Date-Time Middleware
const requestTime = (req, res, next) => {
  req.requestTime = Date.now();
  next();
};

// Use Middleware
app.use(morgan('combined', { stream: accessLogStream }));
app.use(requestTime);
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static('public'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

// app.use(cors()); // use cors  through port 8080
app.use(cors({ cors :'http://localhost:8080',
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const message = `The CORS policy for this application doesnt allow access from this origin: ${origin}`;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  },
}));

// AUTHENTICATION
const auth = require('./auth.js')(app);
require('./passport.js');







// ROUTING
// Home
app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});


//get all movies in mongoose

app.get('/movies', passport.authenticate('jwt', { session: false }),(req, res) => {
 movies.find()
 .then((movies) => {
  res.json(movies);
 })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
    });


//get movies/:title in mongoose 
app.get('/movies/:Title',passport.authenticate('jwt', { session: false }),(req,res)=> {
  movies.findOne({Title: req.params.Title})
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//get movies/director/:directorName
app.get('/movies/director/:directorName',passport.authenticate('jwt', { session: false }),(req,res)=> {
  movies.findOne({"Director.Name": req.params.name})
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});

//get movies/genre/:genreName
app.get('/movies/genre/:genreName',passport.authenticate('jwt', { session: false }),(req,res)=>{movies.findOne({"Genre.Name": req.params.name})
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error:' + err);
    });
});


// Adds data for a new movie to our list of movies in mongoose
app.post('/movies',passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Title: req.body.Title })
    .then((movie) => {
      if (movie) {
        return res.status(400).send(req.body.Title + 'already exists');
      } else {
        movies
          .create({
            Title: req.body.Title,
            Description: req.body.Description,
            Genre: req.body.Genre,
            Director: req.body.Director,
            ImagePath: req.body.ImagePath,
            Featured:req.body.ImagePath
          })
          .then((movie) =>{res.status(201).json(movie) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Adds data for a new user to our list of users in mongoose
app.post('/users', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOne({ userName: req.body.userName})
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.userName + 'already exists');
      } else {
        users
          .create({
            userName: req.body.Username,
            password: req.body.password,
            email: req.body.email,
            Birthday: req.body.Birthday,
            favoriteMovie:req.body.favoriteMovie
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});
// delete one user by  username
app.delete('/users/:userName',passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ userName: req.params.userName })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// delete one movie by  title
app.delete('/movies/:Title',passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        res.status(400).send(req.params.Title + ' was not found');
      } else {
        res.status(200).send(req.params.Title + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID',passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({userName: req.params.userName }, {
     $push: { favoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//update user in mongoose
app.put('/users/:userName',passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ userName: req.params.userName}, { $set:
    {
    userName: req.body.userName,
    Password: req.body.Password,
    Email: req.body.Email,
    Birthday: req.body.Birthday,
    favoriteMovie:req.body.favoriteMovie
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});



// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
