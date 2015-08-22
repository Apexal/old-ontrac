function sockets() {
  var chat_notification = new Audio('/sounds/ding.mp3');

  var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
  var socket = io.connect(full);
  var username = $('#send-message').data("username");
  var online = [];
  var list = $("#online-user-list");


  if (!localStorage['user-status']){
    localStorage['user-status'] = "online";
  }
  var status = localStorage['user-status'];

  $("#user-status b").text(status.charAt(0).toUpperCase() + status.substring(1));
  socket.emit('setstatus', {status: status});

  socket.on('connect', function () {
    sessionId = socket.io.engine.id;
    console.log('Connected ' + sessionId);
  });
  socket.on('error', function (reason) {
    console.log('Unable to connect to server', reason);
  });
  socket.on('online-list', function(data) {
    online = data.users;
    console.log(data.users);
    $("#users-online").text(online.length+" users online");
    if(list.length){
      update_online_list();
    }
  });
  socket.on('refresh', function(data) {
    location.reload();
  });


  // Online User List

  function update_online_list() {
    list.html("");
    var names = [];
    online.forEach(function(user) {

      if(user.status != "offline")
        names.push("<span class='user-badge' data-username='"+user.username+"'>"+user.username+" ("+user.status+")</span>");
    });
    list.html(names.join(', '));
    userbadges();
  }



  // Game
  if($("#canvas").length){
    socket.emit('game-get-playerlist');
    socket.on('game-playerlist', function(data) {
      setPlayers(data.players);
    });
  }





  // RECENT ACTIVITY
  if($("#recent-activity").length){
    socket.on('recent-action', function(data) {
      alert(data);
    });
  }






  // USER STATUS BUTTONS
  $("#user-status li a").click(function() {
    var status = $(this).text().toLowerCase().trim();
    //alert(status);
    localStorage['user-status'] = status;
    socket.emit('setstatus', {status: status});
    $("#user-status b").text($(this).text());
  });







  // CHAT SYSTEM

  var messages = [];
  $("#chat-box").submit(function(e){
      return false;
  });

  socket.on('pastMessages', function(data) {
    messages = data.messages;
    showMessages();
  });

  var showMessages = function() {
    var html = '<br>';
    for(var i=0; i<messages.length; i++) {
        var user = messages[i].user;
        var message = messages[i].message;
        var when = moment(messages[i].when);

        var part = "";

        if(user.username == username){
          part += "<div class='panel panel-default message clearfix othermessage'>";

          if(user.username == "testuser")
            part += "<img src='http://placehold.it/50x62'>";
          else
            part += "<img src='https://webeim.regis.org/photos/regis/Student/"+user.code+".jpg'>";
          part += "<small title='"+when.format("dddd, MMMM Do YYYY, h:mm:ss a")+"'class='left padded'>"+when.fromNow()+"</small>";

          part += "<div class='padded clearfix'>";
          part += "<b><a class='undecorated' title='"+user.username+"'href='/users/"+user.username+"'>"+user.name+"</a></b><br>";
          part += "<span>"+message+"</span>";
          part += "</div>";
        }else{
          part += "<div class='panel panel-default message clearfix mymessage'>";

          if(user.username == "testuser")
            part += "<img src='http://placehold.it/50x62'>";
          else
            part += "<img src='https://webeim.regis.org/photos/regis/Student/"+user.code+".jpg'>";

          part += "<div class='padded clearfix'>";
          part += "<b><a class='undecorated' title='"+user.username+"'href='/users/"+user.username+"'>"+user.name+"</a></b><br>";
          part += "<span>"+message+"</span>";
          part += "</div>";

          part += "<small title='"+when.format("dddd, MMMM Do YYYY, h:mm:ss a")+"'class='right padded'>"+when.fromNow()+"</small>";

        }

        part += "</div>";
        html += part;
    }
    $("#chat-messages").html(html);
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
  };

  socket.on('message', function (data) {
    if(data.message) {
        messages.push(data);
        if(data.user.username != username)
          chat_notification.play();
        showMessages();
    } else {
        console.log("There is a problem:", data);
    }
  });

  function sendMessage() {
    var message = $('#chat-message').val();
    socket.emit("message", {message: message, when: moment().toDate()});
  }

  function outgoingMessageKeyDown(event) {
    if (event.which == 13) {
      if ($('#chat-message').val().trim().length <= 0) {
        return;
      }
      sendMessage();
      $('#chat-message').val('');
    }
  }

  function outgoingMessageKeyUp() {
    var message = $('#chat-message').val();
    $('#send-message').attr('disabled', (message.trim()).length > 0 ? false : true);
  }

  $('#chat-message').on('keydown', outgoingMessageKeyDown);
  $('#chat-message').on('keyup', outgoingMessageKeyUp);
  $('#send-message').on('click', sendMessage);
}
