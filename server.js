// start code here
const express = require('express')
const parser = require('body-parser');
const mongoose = require("mongoose");
var ejs = require('ejs');
var path = require ('path');

const app = express();

const port = 3000;

app.use(parser.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');

// mongo connection
mongoose.connect('mongodb://127.0.0.1/Multi', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const Schema = mongoose.Schema;

// mongo scheema user
const UserSchema = new Schema({
    username: String,
    password: String,
    friends: [],
    wordleHS: String,
    connect4HS: String
  });

const UserData = mongoose.model('UserData', UserSchema);

// render homepage here

// checks a user exists in data
app.post('/login', async (req, res) => {

    let users = []
  
    let user = req.body.username
    let pass = req.body.password
  
    let foundUser = await UserData.findOne({ username: user, password: pass }).exec();
  
    let usersObj = JSON.stringify(foundUser);
  
    res.send(usersObj);
  
    return;
  
  });

  app.get('/get/friends/:USERNAME', async (req, res) => {

    // not tested

    let users = []
    let items = []
  
    console.log(req.session)
  
    UserData.find({ username: req.params.USERNAME }).then((users) => {
      let friend = users[0].friends
      ItemData.find({ _id: { $in: friends } }).then((items) => {
        res.status(200).json(items)
      })
  
    })
      .catch(() => {
        res.status(500).json({ error: 'error' })
      })
  
  })

  app.get('/get/leaderboard/connect4', async (req, res) => {

    // find top 10 connect 4
  
  })

  app.get('/get/leaderboard/wordle', async (req, res) => {

    // find top 10 wordle
  
  })

  
// sends user data to mongodb
app.post('/add/user/', function (req, res) {
  let newUserData = new UserData({
    username: req.body.username,
    password: req.body.password,
    listings: [],
    purchases: []
  });
  newUserData.save();
  res.redirect('index');
})

app.listen(port, () =>
console.log(
  `Example app listening at http://localhost:${port}`));
