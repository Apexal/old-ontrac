function login() {
  var loggingIn = false;
  $("#login-button").click(function() {
    var username = $("#username").val();
    var password = $("#password").val();
    if(!username || !password)
      return;

    $("#login-button").text("Logging in...");
    $("body").css("cursor", "wait");
    if(loggingIn == false){
      loggingIn = true;
      $.post("/login", {
          username: username,
          password: password
      }, function(data) {
          $("#login-errors .alert").remove();
          if (data.errors) {
              for (var err in data.errors) {
                  $("#login-errors").append("<div class='alert alert-danger'>"+
                    data.errors[err]+"</div>");
              }
              $("#login-button").text("Login");
              $("body").css("cursor", "auto");
              loggingIn = false;
          } else {
              window.location.href = $("#login-form").data(
                  "redirect");
          }
      });
    }
  });
}
