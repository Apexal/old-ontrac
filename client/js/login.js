function login() {
  var loggingIn = false;

  var login = function() {
    var username = $("#username").val();
    var password = $("#password").val();
    if (!username || !password)
      return;
    
    $("#login-errors .alert").remove();
    $("#login-button").text("Logging in...");
    $("body").css("cursor", "wait");
    if (loggingIn == false) {
      loggingIn = true;

      $.ajax({
        type: "POST",
        url: "/login",
        data: {
          username: username,
          password: password
        },
        success: function(data) {
          $("#login-errors .alert").remove();
          if (data.errors) {
            data.errors.forEach(function(error) {
              $("#login-errors").append("<div class='alert alert-danger'>" +
                error + "</div>");
            });
            $("#login-button").text("Login");
            $("body").css("cursor", "auto");
            loggingIn = false;
          } else {
            window.location.href = $("#login-form").data(
              "redirect");
          }
        },
        error: function(XMLHttpRequest, textStatus, error) {
          $("#login-errors .alert").remove();
          console.log(textStatus + ": " + error);
          $("#login-button").text("Login");
          $("body").css("cursor", "auto");
          loggingIn = false;

          $("#login-errors").append("<div class='alert alert-danger'>" +
            "There is an issue with the server! Please tell Frank!</div>");
        }
      });
    }
  };

  $("#password").keypress(function(e) {
    if (e.which == 13) {
      login();
    }
  });
  $("#login-button").click(login);
}
