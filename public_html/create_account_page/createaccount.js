
function create() {
  // popup for username taken

  let user = document.querySelector("#ac_username_input");
	let pass = document.querySelector("#ac_password_input");

	var obj = {
		username: user.value,
		password: pass.value
	};

	let p = fetch("/add/user", {
		method: 'POST',
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(obj)
	});
	p.then((response) => {
		return response.text();
	  }).then((text) => {
		alert(text);
		if (text.startsWith('SUCCESS')) {
			window.location.href = "../index.html";
		}
	  });
  	
}
