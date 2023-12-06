function passwordToggle() {
    var x = document.getElementById("ls_password_input");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

function login() {
	let user = document.querySelector("#ls_username_input");
	let pass = document.querySelector("#ls_password_input");

	var obj = {
		username: user.value,
		password: pass.value
	};

  fetch("/login", {
		method: 'POST',
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(obj)
	})
		.then(response => { return response.json(); })
		.then((userObject) => {
			if (userObject) {
				console.log('valid')
				console.log(userObject)
				window.location.href = "../menu_page/menu.html"
			} else {
				// add popup
				console.log('invalid: user not found')
			}
		})
  
}