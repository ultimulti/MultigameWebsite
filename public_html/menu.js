// const socket = io();

function hostGame() {
    // create cookie with random id with fetch request and redirect
}

function joinGame() {
    // create cookie with room id from page and redirect
    let roomId = document.getElementById('room_name').value;

}

function wordle() {
    window.location.href = '../wordle/index.html';
}

document.getElementById("m_wordle_button").addEventListener("click", wordle);