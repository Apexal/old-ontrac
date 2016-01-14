var online = [];

if(sessionStorage['user-status'] === undefined) sessionStorage['user-status'] = "available";

modules.push({
  name: "online",
  check: function() {
    return loggedIn;
  },
  run: function() {
    var list = $("#online-list, #online-list-mobile");

    var update_online_lists = function () {
      $(".user-list-status").remove();
      list.html("");

      var usernames = [];

      var names = [];
      var advnames = [];
      var count = 0;

      online.forEach(function(user) {
        if(user.status === undefined)
          user.status = "available";

        if(user.status != "offline"){
          count +=1;
          usernames.push(user.username);
          names.push("<span class='user-badge' data-username='"+user.username+"'>"+(user.username == username ? "<b>You</b>" : user.username)+" <img src='/images/statuses/status-"+user.status.toLowerCase().replace(" ", "")+".png'></span>");
        }

        if(user.status == "offline" && user.username == username)
          names.push("<span class='user-badge text-muted' data-username='"+username+"'><b>You</b><img src='/images/statuses/status-"+user.status.toLowerCase().replace(" ", "")+".png'></span>");

        if(user.username == username){
          //if(sessionStorage['user-status'].toLowerCase() !== user.status.toLowerCase())
          if(user.tabs < 2 && user.status !== sessionStorage['user-status']){
            sendStatus();
          }else{
            sessionStorage['user-status'] = user.status.toLowerCase();
            sendStatusNoLoop();
          }
        }

        // IF YOU'RE ON AN ONLINE USER'S PROFILE
        if(PAGE.indexOf("/users/") > -1){
          var profileUsername = PAGE.split("/")[2];
          if(user.username == profileUsername){
            $("#profile-status")
              .attr("src", "/images/statuses/status-"+user.status.toLowerCase().replace(" ", "")+".png")
              .attr("title", $("#profile-status").data("name")+" is "+user.status+"!");
          }
        }else if(PAGE == "/users"){
          // IF YOU'RE ON THE USER LIST PAGE
          var uBtn = $("button.btn.user-badge[data-username='"+user.username+"']");
          var name = uBtn.data("name");
          if(user.status !== "offline")
            uBtn.html(name+" <img class='user-list-status' src='/images/statuses/status-"+user.status.toLowerCase().replace(" ", "")+".png'>");
          else
            uBtn.html(name);
        }
      });

      $("#users-online").text(count+" user(s)");
      $(".online-badge span").text(count+" online");
      $(".online-badge").attr("data-content", names.join('<br>'));

      list.html(names.join(''));
      personbadges();
    }


    sendStatus = function (){
      var status = sessionStorage['user-status'].toLowerCase();
      if(status === undefined)
        sessionStorage['user-status'] = status = "available";

      socket.emit('setstatus', {status: status});

      $("#status-circle").attr("src", "/images/statuses/status-"+status.replace(" ", "")+".png");
      $("#user-status b").html(status+(status !== "in class" ? "<span class='caret'></span>" : ""));
    }

    var sendStatusNoLoop = function (){
      var status = sessionStorage['user-status'].toLowerCase();
      if(status === undefined)
        sessionStorage['user-status'] = status = "available";

      $("#status-circle").attr("src", "/images/statuses/status-"+status.replace(" ", "")+".png");
      $("#user-status b").html(status+(status !== "in class" ? "<span class='caret'></span>" : ""));
    }

    // USER STATUS BUTTONS
    $("#user-status li a").click(function() {
      if(sessionStorage['user-status'] == "in class")
        return;

      var status = sessionStorage['user-status'] = $(this).text().toLowerCase().trim();
      sendStatus();
      if(['in class', 'working', 'busy', 'offline'].indexOf(status) > -1){
        if(sessionStorage.muted == "0")
          sendNotification("warning", "", "Muted chat due to status.");
        set_muted(true);
      }
    });

    socket.on('online-list', function(data) {
      online = data.users;
      update_online_lists();
    });
  }
});
