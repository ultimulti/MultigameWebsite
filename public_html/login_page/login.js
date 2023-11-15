function passwordToggle() {
    var x = document.getElementById("ls_password_input");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }