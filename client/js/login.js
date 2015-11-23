function login() {
  var loggingIn = false;

  var login = function() {
    var username = $("#username").val();
    var password = $("#password").val();
    if(!username || !password)
      return;

    $("#login-button").text("Logging in...");
    $("body").css("cursor", "wait");
    if(loggingIn == false){
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
        },
        error: function(XMLHttpRequest, textStatus, error){
          $("#login-errors .alert").remove();
          console.log(textStatus +": "+error);
          $("#login-button").text("Login");
          $("body").css("cursor", "auto");
          loggingIn = false;

          $("#login-errors").append("<div class='alert alert-danger'>"+
            "There is an issue with the server! Please tell Frank!</div>");
        }
      });
      /*
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
      });*/
    }
  };

  $("#password").keypress(function(e) {
    if(e.which == 13) {
      login();
    }
  });
  $("#login-button").click(login);
}
