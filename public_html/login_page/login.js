function passwordToggle() {
    var x = document.getElementById("ls_password_input");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

function login() {
  // need to check for user in db
  window.location.href = "../menu_page/menu.html"
}