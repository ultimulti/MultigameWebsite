document.addEventListener("DOMContentLoaded", () => {
  createSquares();
  getNewWord();
  let guessedWords = [[]]; // array of arrays of letters
  let availableSpace = 1; // the next available space on the board
  let word; // the word to be guessed
  let guessedWordCount = 0; // number of words guessed

  let lastDeletableIndex = 0; // index of the last deletable letter

  const keys = document.querySelectorAll(".keyboard-row button");
  // popup window for winning
  function toggleMode(){
    console.log("toggle");
    setTimeout(() => {
    var blur = document.getElementById("blur");
    blur.classList.toggle('active');
    
    var popup = document.getElementById("popup");
    popup.classList.toggle('active');}, 1500);
  }

  // popup window for losing
  function toggleMode2(actualWord){
    console.log("toggle");
    setTimeout(() => {
    var blur = document.getElementById("blur");
    blur.classList.toggle('active');

    document.getElementById("popup-title").innerHTML = 'Uh OH';
    document.getElementById("popup-message").innerHTML = `Sorry, you have no more guesses! The word is ${actualWord}.`;
    var popup = document.getElementById("popup");
    popup.classList.toggle('active');}
    , 1500);
  }
  // graphing the result graph
  function graph(){
    var x = [1,2,3,4,5,6];
    var y = [1,2,3,4,5,6]; // replace with actual data
    barColor = "green";
    const chart = new Chart("myChart", {
      type: "horizontalBar",
      data: {
        labels: x,
        
        datasets: [{
          backgroundColor: barColor,
          data: y
        }]
      },
      options: {
        legend: {display: false},
        title: {
          display: true,
          text: "Current Record"
        },
        scales: {
          xAxes: [{
              barPercentage: 1.3,
          }]
      }
      }
    });
  }
  // fetches a new word from the server
  function getNewWord(){
    fetch('/getword', {
      method: 'GET'
    }).then((response) => {
      return response.text();
    }).then((text) => {
      word = text;
        //debug
      word = "asset";
    });
  }

  // returns the current word array
  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  // updates the guessed words array
  function updateGuessedWords(letter) {
    const currentWordArr = getCurrentWordArr();
    console.log(currentWordArr);
    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(String(availableSpace));

      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
    }
  }

  // returns the color of the tile
  function getTileColor(letter, index) {
    const isCorrectLetter = word.includes(letter);

    if (!isCorrectLetter) {
      return "rgb(58, 58, 60)";
    }

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;

    if (isCorrectPosition) {
      return "rgb(83, 141, 78)";
    }

    return "rgb(181, 159, 59)";
  }

  // handles the submission of the word
  function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters");
      return;
    }

    const currentWord = currentWordArr.join("");

    fetch(('/checklib/' + currentWord), {
      method: "GET"})
      .then((res) => {
        return res.text();
      }).then((text) =>{
        if (text == 1){
          window.alert('Not a valid word!');
        } else {
          const firstLetterId = guessedWordCount * 5 + 1;
          const interval = 200;
          currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
              const tileColor = getTileColor(letter, index);

              // change the color of the virtual keyboard
              temp_key = document.querySelectorAll(`[data-key="${letter}"]`);
              temp_key[0].style = `background-color:${tileColor};border-color:${tileColor}`;

              // change the color of the letter on the board
              const letterId = firstLetterId + index;
              const letterEl = document.getElementById(letterId);
              letterEl.classList.add("animate__flipInX");
              letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
            
            }, interval * index);
            
          });

          guessedWordCount += 1;
          lastDeletableIndex = guessedWordCount * 5;
          if (currentWord === word) {
            console.log(guessedWordCount);
            graph();
            toggleMode();
            //window.alert("Congratulations!");
          }

          if (guessedWords.length === 6) {
            graph();
            toggleMode2(word);
            //window.alert(`Sorry, you have no more guesses! The word is ${word}.`);
            
          }

          guessedWords.push([]);
      }
    })
  }
  // creates the squares of the grid/game board
  function createSquares() {
    const gameBoard = document.getElementById("board");

    for (let index = 0; index < 30; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.classList.add("animate__animated");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }
  }

  // handles the keydown event
  function HandleKeyDown(event) {
    console.log(event.key);
    const key = event.key;
    //negate the keys that are not letters
    negate = ["Control", "Alt", "Shift", "Meta", "!","@","#","$","%","^","&","*","(",")","_","+","-","=","[","]","{","}","|",";",":","'","<",">","?","/","~","`","\\","\"","."," ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    for (let i = 0; i < negate.length; i++) {
      if (key === negate[i]) {
        return;
      }
    }
    if (key === "Enter") {
      handleSubmitWord();
      return;
    }

    if (key === "Backspace") {
      handleDeleteLetter();
      return;
    }

    updateGuessedWords(key);
  }

  // handles the deletion of the letter
  function handleDeleteLetter() {

    // Delete the letter from the current word array
    const currentWordArr = getCurrentWordArr();
    guessedWords[guessedWords.length - 1] = currentWordArr;
    

    // Stop deleting letters outside of the current line
    if (lastDeletableIndex < availableSpace -1 ){
      const lastLetterEl = document.getElementById(String(availableSpace - 1));

      lastLetterEl.textContent = "";
      availableSpace = availableSpace - 1;
      currentWordArr.pop();
    }
  }

  //add functionality to the keyboard
  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
      const letter = target.getAttribute("data-key");
      if (letter === "enter") {
        handleSubmitWord();
        return;
      }

      if (letter === "del") {
        handleDeleteLetter();
        return;
      }

      updateGuessedWords(letter);
    };  
  }
  // add functionality to the keyboard
  document.addEventListener("keydown", HandleKeyDown);
  // Handle the play again button
  document.getElementById("popup-button").addEventListener("click", () => {
    location.reload();
  });
  //Handle the home button
  document.getElementById("home-button").addEventListener("click", () => {
    window.location.href = '../menu_page/menu.html';
  });

  //
  document.getElementById("home").addEventListener("click", () => {
    window.location.href = '../menu_page/menu.html';
  });
});