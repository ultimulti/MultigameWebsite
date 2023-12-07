const socket = io();

var playerOne = "P1";
var playerTwo = "P2";
var currentPlayer = playerOne;
var playerName = '';
var currentPlayerName = '';

var currCols = [];
var board = [];
var gameOver = false;
var gameStart = false;

let roomId = '';

fetch('http://127.0.0.1:3000/get-cookies')
.then((res) => {
  return res.json();
})
.then((cookies) => {
  console.log(cookies);
  roomId = cookies.roomID;
  playerName = cookies.login.username
  document.getElementById('ROOMID').innerHTML = 'Room Id: ' + roomId;
  socket.emit("join-room", roomId, message => {
    console.log(message)
  });
});

socket.on('connect', ()=> {
  socket.emit('check-for-opponent', roomId, (playerCount) => {
    if (playerCount == 1) {
      currentPlayerName = playerName;
      localStorage.setItem("player", "P1");
      document.getElementById('title').innerHTML = 'You are player 1';
    } else if(playerCount == 2) {
      localStorage.setItem("player", "P2");
      document.getElementById('title').innerHTML = 'You are player 2';
    }
  });
});

socket.on('start-game', () => {
  gameStart = true;
})


function makeRows(rows, cols) {
  let container = document.getElementById("gameContainer");
  container.style.setProperty('--grid-rows', rows);
  container.style.setProperty('--grid-cols', cols);
  currCols = [5, 5, 5, 5, 5, 5, 5];

  for (let r = 0; r < 6; r++) {
    let row = [];
    for (let c = 0; c < 7; c++) {
      // JS
      row.push(' ');
      // HTML
      let cell = document.createElement("div");
      cell.id = r.toString() + "-" + c.toString();
      cell.classList.add("tile");
      cell.addEventListener("click", placePiece);
      container.appendChild(cell).className = "grid-item";
    }
    board.push(row);
  }
};

function checkWinner(player) {
  // horizontal
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7 - 3; c++) {
      if (board[r][c] != ' ') {
        if (board[r][c] == board[r][c + 1] && board[r][c + 1] == board[r][c + 2] && board[r][c + 2] == board[r][c + 3]) {
          winGame(player);
          return;
        }
      }
    }
  }

  // vertical
  for (let c = 0; c < 7; c++) {
    for (let r = 0; r < 6 - 3; r++) {
      if (board[r][c] != ' ') {
        if (board[r][c] == board[r + 1][c] && board[r + 1][c] == board[r + 2][c] && board[r + 2][c] == board[r + 3][c]) {
          winGame(player);
          return;
        }
      }
    }
  }

  // anti diagonal
  for (let r = 0; r < 6 - 3; r++) {
    for (let c = 0; c < 7 - 3; c++) {
      if (board[r][c] != ' ') {
        if (board[r][c] == board[r + 1][c + 1] && board[r + 1][c + 1] == board[r + 2][c + 2] && board[r + 2][c + 2] == board[r + 3][c + 3]) {
          winGame(player);
          return;
        }
      }
    }
  }

  // diagonal
  for (let r = 3; r < 6; r++) {
    for (let c = 0; c < 7 - 3; c++) {
      if (board[r][c] != ' ') {
        if (board[r][c] == board[r - 1][c + 1] && board[r - 1][c + 1] == board[r - 2][c + 2] && board[r - 2][c + 2] == board[r - 3][c + 3]) {
          winGame(player);
          return;
        }
      }
    }
  }
}

function placePiece() {
  // check game status
  if (gameOver || gameStart == false || localStorage.getItem('player') != currentPlayer) {
    return;
  }

  let row_col = this.id.split('-');
  let row = parseInt(row_col[0]);
  let col = parseInt(row_col[1]);

  // update gamestate board
  row = currCols[col];
  if (row < 0) {
    return;
  }

  socket.emit('new-move', playerName, roomId, row, col)
}

socket.on('update-board', (row, col, player) => {
  console.log('current player is: ', currentPlayer);
  console.log(row, col);
  board[row][col] = currentPlayer;
  let tile = document.getElementById(row.toString() + '-' + col.toString());

  checkWinner(player);

  if (currentPlayer == playerOne) {
    tile.classList.add('player-one');
    currentPlayer = playerTwo;
  } else {
    tile.classList.add('player-two');
    currentPlayer = playerOne;
  }

  row -= 1;
  currCols[col] = row;
});

function winGame(player) {
  let winner = document.getElementById("title");
  if (currentPlayer == playerOne) {
      winner.innerText = "Player One Wins!";
  } else {
      winner.innerText = "Player Two Wins!";
  }

  fetch('http://127.0.0.1:3000/post/connect4', {
    method: 'POST',
    body: JSON.stringify({
      username: player
    }),
    headers: { 'Content-Type': 'application/json'}
  })
  .then((res)=> {
    if(res.ok) {
      return res.json();
    } else {
      document.getElementById("scoreError").innerText = 'problem updating score';
      throw new Error('problem updating score');
    }
  })

  gameOver = true;
  localStorage.clear();
  document.getElementById("take_home_button").classList.toggle('off');
  document.getElementById("gameContainer").style.display = 'none';
}

function takeHome() {
  localStorage.clear();
  window.location.href = "../menu_page/menu.html"
}