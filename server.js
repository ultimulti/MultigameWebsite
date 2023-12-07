const express = require('express')
const parser = require('body-parser');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

var ejs = require('ejs');
var path = require ('path');

const app = express();

const port = 3000;

app.use(parser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public_html')); // serve files in public_html
app.use(cookieParser());


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

