const express = require('express')
const parser = require('body-parser');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

//var ejs = require('ejs');
var path = require ('path');
const crypto = require('crypto');

const app = express();

const port = 3000;

app.use(parser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public_html')); // serve files in public_html
app.use(cookieParser());

/*
Thompson's Wordle code. 
*/
//==========================================================================
const fs = require('fs'); // file system module
const { resourceLimits } = require('worker_threads');

//set up storage for answer words and valid words.
const answerList = [];
const validList = [];

//fill in the storage for answer words and valid words. 
function getAnswerAndKeyList() {
    const answerData = fs.readFileSync('public_html/answer.txt','utf8');
    const validData = fs.readFileSync('public_html/valid.txt','utf8');

    answerList.push(...answerData.split('\r\n'));
    validList.push(...validData.split('\r\n'));
    }

// get answer and key and store them in the lists
getAnswerAndKeyList();

// Temporarily serve the wordle folder for debugging
//app.use(express.static("public_html/wordle"));

//get a random word from the dictionary
app.get('/getword', function(req, res){
  res.statusCode = 200;
  res.end(answerList[Math.floor(Math.random()*answerList.length)]);
});

// checking if word is in the dictionary 
app.get('/checklib/:word', function(req, res){
  res.statusCode = 200;

  let word = req.params.word;
  let res_end = '';
  /*
  if word is not an English word, res.end = 1
  else res.end = 0
  */
  if (!validList.includes(word)){
      res_end = '1';
  } else {
      res_end = '0';
  }
  res.end(res_end);
});
//==========================================================================
/*
End of Thompson's server section
*/





app.set('view engine', 'ejs');
// mongo connection
connection_string = "mongodb+srv://manhtu123:manhtu@pa7.5b6knjp.mongodb.net/?retryWrites=true&w=majority";;
mongoose.connect(connection_string);
mongoose.connection.on('error', () => {
  console.log('There was a problem connecting to mongoDB');
});

const Schema = mongoose.Schema;

// mongo scheema user
const UserSchema = new Schema({
    username: String,
    hash: String,
    salt: String,
    friends: [{type: String}],
    wordleHS: [{type: Number}],
    connect4HS: Number
  });

const UserData = mongoose.model('UserData', UserSchema);



/*
Login and Cookie section
*/
//==========================================================================
// Adding session for each user.
let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = {id: sid, time: now};
  return sid;
}

//Removing session after 2000000 ms
function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    if (last + 2000000 < now) {
      delete sessions[usernames[i]];
    }
  }
  console.log(sessions);
}

// Authenticate user
function authenticate(req, res, next) {
  let c = req.cookies;
  console.log('auth request:');
  console.log(req.cookies);
  if (c != undefined) {
    if (sessions[c.login.username] != undefined && 
      sessions[c.login.username].id == c.login.sessionID) {
      next();
    } else {
      res.redirect('../index.html');
    }
  }  else {
    res.redirect('../index.html');
  }
}

// Check for update on cookie every 2s
setInterval(removeSessions, 2000);


// checks a user exists in data. If yes, prompt user to login or. If no, create the account
app.post('/add/user', function(req, res){
  var user = req.body.username;
  var pass = req.body.password;
  let p1 = UserData.find({username: {$regex: user}}).exec();
  p1.then((documents) =>{
      console.log(documents);
      console.log(documents.length);
      if(documents.length == 0){
          let newSalt = '' + Math.floor(Math.random() * 10000000000);
          let toHash = pass + newSalt;
          let h = crypto.createHash('sha3-256');
          let data = h.update(toHash, 'utf-8');
          let result = data.digest('hex');

          let newUser = new UserData({username: user, hash: result, salt: newSalt, friends: [], wordleHS: [], connect4HS: 0});
          let p = newUser.save();
          p.then(()=> {
              console.log('USER CREATED');
          });
          p.catch((error) => {
              console.log('Save failed');
              console.log(error);
          });
          res.end('SUCCESS');
      } else {
          res.end('Username already exists. Please login or change your username');
      }
  })
})

// Login user
app.post('/login/user', function(req, res){
  var user = req.body.username;
  var u = req.body;
  let p1 = UserData.find({username: {$regex: user}}).exec();
  p1.then((documents) =>{
      if(documents.length == 0){
          res.end('Username not found!');
      } else {
          let currentUser = documents[0];
          let toHash = u.password + currentUser.salt;
          let h = crypto.createHash('sha3-256');
          let data = h.update(toHash, 'utf-8');
          let result = data.digest('hex');

          console.log(toHash);
          console.log('HASH WE JUST MADE:');
          console.log(result);
          console.log('THE ORIGINAL HASH:');
          console.log(currentUser.hash);

          if (result == currentUser.hash){
              let sid = addSession(user); 
              res.cookie("login", 
                {username: user, sessionID: sid}, 
                {maxAge: 10000000 * 2 });
              res.end('SUCCESS');
          }
          else {
              res.end('Password not matching!');
          }
      }
  })
})

app.use('./public_html/*', authenticate);
// Getting the current user. 
app.get('/current/user', function(req, res){
  res.end(req.cookies.login.username);
});
//==========================================================================
/*
End of Login and User Session
*/


  app.get('/get/friends/:USERNAME', async (req, res) => {

    let users = []
    let items = []

    console.log(req.session)

    UserData.find({ username: req.params.USERNAME }).then((users) => {
      let listing = users[0].friends
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

    UserData.find().sort( { connect4HS : -1 } ).then((users) => {
      res.status(200).json(users)
    })

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

// sets the cookie in the browser for 10 minutes
app.get('/set-room-cookie/:id', (req, res) => {
  console.log('reqesting cookie', req.params.id);
  let roomId = '';
  if(req.params.id !== 'new') {
    roomId = req.params.id;
    console.log('setting roomId to passed id: ' + roomId);
  } else {
    let characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // characters used in string
    for (let i = 6; i > 0; i--) {
      console.log(i);
      roomId += characters[Math.floor(Math.random() * characters.length)];
    }
    console.log('generated new roomId: ', roomId);
  }
  res.cookie('roomID', roomId, {
    maxAge: 600000
  }).send();
});

app.get('/get-cookies', (req, res) => {
  res.send(req.cookies);
});

const expressServer = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const io = require('socket.io')(expressServer, {
  cors: {
    origin: "*"
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id)

  socket.on('join-room', (room, cb) => {
    socket.join(room);
    cb(`Joined room ${room}`);
  });

  socket.on('check-for-opponent', (roomId, cb) => {
    io.in(roomId).fetchSockets()
    .then((sockets) => {
      let playercount = sockets.length;
      cb(playercount);
      if(playercount == 2) {
        console.log('start game');
        io.in(roomId).emit('start-game');
      }
    })
  });

  socket.on('new-move', (roomId, row, col) => {
    console.log(row, col);
    io.in(roomId).emit('update-board', row, col);
  })

});

