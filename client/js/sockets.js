function toggle_muted(){
  sessionStorage.muted = (sessionStorage.muted == "1" ? "0" : "1");
  if(sessionStorage.muted == "1"){
    $("#mute-toggle").text("(Unmute)");
  }else{
    $("#mute-toggle").text("(Mute)");
  }
}

function set_muted(to){
  if(to){
    sessionStorage.muted = "1";
    $("#mute-toggle").text("(Unmute)");
  }else{
    sessionStorage.muted = "0";
    $("#mute-toggle").text("(Mute)");
  }
}

function sockets() {
  var chat_notification = new Audio('/sounds/ding.mp3');

  var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
  var socket = io.connect(full);
  var username = $('#send-message').data("username");
  var online = [];
  var list = $("#online-list, #online-list-mobile");
  var advlist= $("#advchat-online");
  var title = $("title").text();

  var advisement = ( $("#advchat").length > 0 ? $("#advchat").data('adv') : '');
  var advchatmessages = [];

  if (!localStorage['user-status']){
    localStorage['user-status'] = "online";
  }
  var status = localStorage['user-status'];

  if(['in class', 'working', 'busy', 'offline'].indexOf(status.toLowerCase()) > -1){
    if(sessionStorage.muted == "0")
      sendNotification("warning", "", "Muted chat due to status.");
    set_muted(true);
  }

  $("#user-status b").html(status.charAt(0).toUpperCase() + status.substring(1)+"<span class='caret'></span>");
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
    //console.log(data.users);
    update_online_lists();
  });
  socket.on('refresh', function(data) {
    location.reload();
  });

  socket.on('new-login', function(data) {
    //alert("WOW");
    sendNotification('info', 'User Login', data.username+' has just logged in!');
  });

  socket.on('new-logout', function(data) {
    //alert("WOW");
    sendNotification('error', 'User Login', data.username+' has just logged out!');
  });

  // Online User List

  function update_online_lists() {
    list.html("");
    if(advlist.length)
      advlist.html("<span>Nobody!</span>");

    var names = [];
    var advnames = [];
    var count = 0;

    online.forEach(function(user) {
      if(user.status != "offline")
        count +=1;

      if(user.status != "offline")
        names.push("<span class='user-badge' data-username='"+user.username+"'>"+(user.username == username ? "<b>You</b>" : user.username)+" <i class='right'>"+user.status+"</i></span><br>");

      if(user.status == "offline" && user.username == username)
        names.push("<span class='user-badge text-muted' data-username='"+username+"'><b>You</b><i class='right'>offline</i></span><br>");

      console.log(user.advisement +" vs "+advisement);
      if(user.advisement == advisement){
        if(user.status != "offline")
          advnames.push("<span class='user-badge' data-username='"+user.username+"'>"+(user.username == username ? "<b>You</b>" : user.username)+" <i>("+user.status+")</i></span>");
        if(user.status == "offline" && user.username == username)
          advnames.push("<span class='user-badge text-muted' data-username='"+username+"'><b>You</b> <i>("+user.status+")</i></span>");
      }
    });

    $("#users-online").text(count+" user(s)");

    list.html(names.join(''));
    if(advlist.length && advnames.length > 0)
      advlist.html(advnames.join(', '));
    userbadges();
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
    $("#user-status b").html($(this).text()+"<span class='caret'></span>");
    if(['in class', 'working', 'busy', 'offline'].indexOf(status.toLowerCase()) > -1){
      if(sessionStorage.muted == "0")
        sendNotification("warning", "", "Muted chat due to status.");
      set_muted(true);
    }
  });








  // ADVISEMENT CHAT SYSTEM

  function sendAdvMessage() {
    var message = $('#advchat-message').val();
    socket.emit("advchat-message", {message: message, when: moment().toDate()});
    $('#advchat-message').val('');
  }

  function outgoingAdvMessageKeyDown(event) {
    if (event.which == 13) {
      if ($('#advchat-message').val().trim().length <= 0) {
        return;
      }
      sendAdvMessage();
    }
  }

  function outgoingAdvMessageKeyUp() {
    var message = $('#advchat-message').val();
    $('#advchat-send').attr('disabled', (message.trim()).length > 0 ? false : true);
  }

  socket.emit('join-advchat');

  socket.on('advchat-pastmessages', function(data) {
    advchatmessages = data.messages;
    if($("#advchat-messages").length)
      showAdvMessages();
  });


  var showAdvMessages = function() {
    var html = '<br>';
    for(var i=0; i<advchatmessages.length; i++) {
        var user = advchatmessages[i].username;
        var message = advchatmessages[i].message;
        var when = moment(advchatmessages[i].when);

        var div = document.createElement('div');
        div.appendChild(document.createTextNode(message));
        message = div.innerHTML;

        var part = "<b class='user-badge' data-username='"+user+"'>"+user+": </b>";
        part += "<span title='"+when.fromNow()+" | "+when.format("dddd, MMMM Do YYYY, h:mm:ss a")+"'>"+message+"</span><br>";
        html += part;
    }
    $("#advchat-messages").html(html);
    $("#advchat-messages").scrollTop($("#advchat-messages")[0].scrollHeight);
    userbadges();
  };

  if($("#advchat").length){
    sessionStorage.advunread = 0;
    socket.on('advchat-message', function(data) {
      console.log("New message from "+data.username+": "+data.message);
      if(data.message) {
          advchatmessages.push(data);
          if(data.username != username && sessionStorage.muted == "0")
            chat_notification.play();
          showAdvMessages();
      } else {
          console.log("There is a problem:", data);
      }
    });

    $('#advchat-message').on('keydown', outgoingAdvMessageKeyDown);
    $('#advchat-message').on('keyup', outgoingAdvMessageKeyUp);
    $('#advchat-send').on('click', sendAdvMessage);
  }else{
    socket.on('advchat-message', function(data) {
      console.log("New message from "+data.username+": "+data.message);
      if(data.message) {
          advchatmessages.push(data);
          if(data.username != username && sessionStorage.muted == "0")
            chat_notification.play();

          if(!sessionStorage.advunread)
            sessionStorage.advunread = 0;

          sessionStorage.advunread = Number(sessionStorage.advunread) + 1;

          $("#advchat-badge").show();
          $("#advchat-badge-mobile").show();
          if(sessionStorage.advunread >= 50){
            $("#advchat-badge").text("50+");
            $("#advchat-badge-mobile").text("50+");
          }else{
            $("#advchat-badge").text(sessionStorage.advunread);
            $("#advchat-badge-mobile").text(sessionStorage.advunread);
          }

      } else {
          console.log("There is a problem:", data);
      }
      updateTitle();
    });
  }

  //  GLOBAL CHAT SYSTEM
  if(sessionStorage.muted == "1") set_muted(true); else set_muted(false);




  $("#mute-toggle").click(toggle_muted);

  var messages = [];
  $("#chat-box").submit(function(e){
      return false;
  });

  socket.on('pastMessages', function(data) {
    messages = data.messages;
    showMessages();
  });

  var showMessages = function() {
    var html = '';
    for(var i=0; i<messages.length; i++) {
        var user = messages[i].username;
        var message = messages[i].message;
        var when = moment(messages[i].when);

        var div = document.createElement('div');
        div.appendChild(document.createTextNode(message));
        message = div.innerHTML;

        var part = "<b class='user-badge' data-username='"+user+"'>"+user+": </b>";
        part += "<span title='"+when.fromNow()+" | "+when.format("dddd, MMMM Do YYYY, h:mm:ss a")+"'>"+message+"</span><br>";
        html += part;
    }
    $("#chat-messages").html(html);
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    userbadges();
  };

  socket.on('message', function (data) {
    if(data.message) {
        messages.push(data);
        if(data.username != username && sessionStorage.muted == "0")
          chat_notification.play();

        if(!sessionStorage.unread)
          sessionStorage.unread = 0;

        if($("#chat-box").hasClass("shown") == false){
          sessionStorage.unread = Number(sessionStorage.unread)+1;

        }else{
          sessionStorage.unread = 0;
        }
        updateTitle();
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
