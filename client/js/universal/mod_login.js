modules.push({
  name: "login-modal",
  check: function(){ return !loggedIn; },
  run: function() {
    var loggingIn = false;
    var registering = false;
    var registered = [];

    var login = function() {
      var username = $("#username").val().trim().toLowerCase();
      var password = $("#password").val().trim();
      if (!username || !password)
        return;

      $("#login-errors .alert").remove();

      if (loggingIn == false && registering == false) {
        $("#login-button").text("Logging in...");
        $("body").css("cursor", "wait");
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
            $("#login-button").text("Login");
            $("body").css("cursor", "auto");
            loggingIn = false;

            $("#login-errors").append("<div class='alert alert-danger'>" +
              "There is an issue with the server! Please tell Frank!</div>");
          }
        });
      }


    };

    $("#back-login").click(function() {
      registering = false;
      $("#terms").hide();
      $("#login-errors .alert").remove();
      $("#login-form").show();
      $("#login-form input").val("");
    });

    $("#accept-terms").click(function() {
      if($(this).hasClass("disabled"))
        return;

      if(confirm("Are you sure you understand the Terms and Conditions?")){
        registering = false;
        $("#terms").hide();
        $("#login-form").show();
        login();
      }
    });

    $("#terms .scroll").scroll(function() {
      var elem = $(this);
      if (elem[0].scrollHeight - elem.scrollTop() < 400) {
        $("#accept-terms").removeClass("disabled");
      }else if($("#accept-terms").hasClass("disabled") == false){
        $("#accept-terms").addClass("disabled");
      }
    });

    $("#password, #username").keypress(function(e) {
      if (e.which == 13) {
        checkRegistered();
      }
    });

    var checkRegistered = function() {
      var username = $("#username").val().trim().toLowerCase();
      var password = $("#password").val().trim();
      if (!username || !password)
        return;
      if(registered.indexOf(username) == -1){
        registering = true;
        $("#login-form").hide();
        $("#terms").show();
      }
      login();
    }

    $.get("/registered", function(data) {
      registered = data;
      $("#login-button").click(checkRegistered);
    })
  }
});
