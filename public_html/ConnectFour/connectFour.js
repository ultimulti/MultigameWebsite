const socket = io();

var playerOne = "P1";
var playerTwo = "P2";
var currentPlayer = playerOne;

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
  document.getElementById('ROOMID').innerHTML = roomId;
  socket.emit("join-room", roomId, message => {
    console.log(message)
  });
});

socket.on('connect', ()=> {
  socket.emit('check-for-opponent', roomId, (playerCount) => {
    console.log('you are player: ', playerCount);
    if (playerCount == 1) {
      document.getElementById('title').innerHTML = 'You are player 1';
      localStorage.setItem("player", "P1");
    } else if(playerCount == 2) {
      document.getElementById('title').innerHTML = 'You are player 2';
      localStorage.setItem("player", "P2");
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

function checkWinner() {
  // horizontal
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7 - 3; c++) {
      if (board[r][c] != ' ') {
        if (board[r][c] == board[r][c + 1] && board[r][c + 1] == board[r][c + 2] && board[r][c + 2] == board[r][c + 3]) {
          winGame(r, c);
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
          winGame(r, c);
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
          winGame(r, c);
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
          winGame(r, c);
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

  // console.log(localStorage.getItem('player'), currentPlayer);
  socket.emit('new-move', roomId, row, col)

  // board[row][col] = currentPlayer;
  // let tile = document.getElementById(row.toString() + '-' + col.toString());
  // if (currentPlayer == playerOne) {
  //   tile.classList.add('player-one');
  //   currentPlayer = playerTwo;
  // } else {
  //   tile.classList.add('player-two');
  //   currentPlayer = playerOne;
  // }

  // row -= 1;
  // currCols[col] = row;
  // checkWinner();
}

socket.on('update-board', (row, col) => {
  console.log('current player is: ', currentPlayer);
  console.log(row, col);
  board[row][col] = currentPlayer;
  let tile = document.getElementById(row.toString() + '-' + col.toString());
  if (currentPlayer == playerOne) {
    tile.classList.add('player-one');
    currentPlayer = playerTwo;
  } else {
    tile.classList.add('player-two');
    currentPlayer = playerOne;
  }

  row -= 1;
  currCols[col] = row;
  checkWinner();
});

function winGame(r, c) {
  let winner = document.getElementById("title");
  if (board[r][c] == playerOne) {
      winner.innerText = "Player One Wins!";
  } else {
      winner.innerText = "Player Two Wins!";
  }
  gameOver = true;
  localStorage.clear();
  document.getElementById("take_home_button").classList.toggle('off');
  document.getElementById("gameContainer").style.display = 'none';
}

function takeHome() {
  window.location.href = "../menu_page/menu.html"
}