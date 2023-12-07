// const socket = io();

function hostGame() {
    // create cookie with random id with fetch request and redirect
    console.log('hosting game');
    fetch('http://127.0.0.1:3000/set-room-cookie/'+'new')
        .then((cookie)=> {
            console.log(cookie);
            window.location.replace("http://127.0.0.1:3000/ConnectFour/connectFour.html");
        });
}

function joinGame() {
    // create cookie with room id from page and redirect
    let roomId = document.getElementById('room_name').value;
    if(roomId.length == 6) {
        console.log('joining game');
        fetch('http://127.0.0.1:3000/set-room-cookie/' + roomId)
        .then((cookie)=> {
            console.log(cookie);
            window.location.replace("http://127.0.0.1:3000/ConnectFour/connectFour.html");
        });
    } else {
        alert('Please enter valid room code');
    }
}

function wordle() {
    window.location.href = '../wordle/index.html';
}

document.getElementById("m_wordle_button").addEventListener("click", wordle);