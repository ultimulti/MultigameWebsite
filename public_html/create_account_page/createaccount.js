
function create() {
  // popup for username taken

  let user = document.querySelector("#ac_username_input");
	let pass = document.querySelector("#ac_password_input");

	var obj = {
		username: user.value,
		password: pass.value
	};

	fetch("/add/user", {
		method: 'POST',
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(obj)
	});

  //added to db, page does not redirect or popup

  window.alert("Account Created!");


  window.location.href = "../index.html"
}
