function wordleLB() {

    let loadLBwordle = fetch(`/get/leaderboard/wordle`);

    loadLBwordle.then(response => {
    
        return response.json();
    
        }).then((items) => {
    
            let results = '';
    
            for (let i = 0; i < items.length ; i++) {
                results += `
                    <div class='lb_user'>
                    <p id="lb_username">${items[i].username}</p>
                    <p id="lb_score">${items[i].wordleHS}</p>
                    </div>`;
                    if (1 == 9) {
                        break
                    }
            }

            document.getElementById('lb_wordle_entry').innerHTML = results;
    
        }).catch(() => {
            console.log('error')
        });

}

function connect4LB() {

    let loadLBconnect4 = fetch(`/get/leaderboard/connect4`);

    loadLBconnect4.then(response => {

        return response.json();
    
        }).then((items) => {
    
            let results = '';
            let count = 0;
    
            for (let i = 0; i < items.length ; i++) {
                results += `
                    <div class='lb_user'>
                    <p id="lb_username">${items[i].username}</p>
                    <p id="lb_score">${items[i].connect4HS}</p>
                    </div>`;
                    if (count == 9) {
                        break
                    }
            }

            document.getElementById('lb_connect4_entry').innerHTML = results;
    
        }).catch(() => {
            console.log('error')
        });

}

function loadBoards () {
    wordleLB();
    connect4LB();
}

