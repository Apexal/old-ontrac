function toggle_muted(){
  sessionStorage.muted = (sessionStorage.muted == "1" ? "0" : "1");
  if(sessionStorage.muted == "1"){
    $("#mute-toggle").removeClass("fa-volume-up");
    $("#mute-toggle").addClass("fa-volume-off");
  }else{
    $("#mute-toggle").removeClass("fa-volume-off");
    $("#mute-toggle").addClass("fa-volume-up");
  }
}

function set_muted(to){
  if(to){
    sessionStorage.muted = "1";
    $("#mute-toggle").removeClass("fa-volume-up");
    $("#mute-toggle").addClass("fa-volume-off");
  }else{
    sessionStorage.muted = "0";
    $("#mute-toggle").removeClass("fa-volume-off");
    $("#mute-toggle").addClass("fa-volume-up");
  }
}

function handleVisibilityChange() {
  if (document[hidden]) {
    console.log("HIDE TAB");
  } else {
    if($("#chat-box").hasClass("shown"))
      sessionStorage.unread = "0";
    updateTitle();
    console.log("SHOWED TAB");
    if(typeof updateDayInfo == 'function' && todayInfo !== undefined) updateDayInfo();
  }
}

function sockets() {
  document.addEventListener(visibilityChange, handleVisibilityChange, false);

  var chat_notification = new Audio('/sounds/ding.mp3');

  var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
  socket = io.connect(full);
  online = [];
  list = $("#online-list, #online-list-mobile");
  advlist= $("#advchat-online");

  var advisement = ( $("#advchat").length > 0 ? $("#advchat").data('adv') : '');
  var advchatmessages = [];

  var status = sessionStorage['user-status'];
  if (!status){
    status = "available";
  }
  setStatus(status);

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

    var usernames = [];

    var names = [];
    var advnames = [];
    var count = 0;

    online.forEach(function(user) {
      if(!user.status)
        user.status = "available";

      if(user.status != "offline"){
        count +=1;
        usernames.push(user.username);
        names.push("<span class='user-badge' data-username='"+user.username+"'>"+(user.username == username ? "<b>You</b>" : user.username)+" <img src='/images/statuses/status-"+user.status.toLowerCase().replace(" ", "")+".png'></span>");
      }

      if(user.status == "offline" && user.username == username)
        names.push("<span class='user-badge text-muted' data-username='"+username+"'><b>You</b><img src='/images/statuses/status-"+user.status.toLowerCase().replace(" ", "")+".png'></span>");

      if(user.username == username)
        setStatusNoLoop(user.status);

      //console.log(user.advisement +" vs "+advisement);
      if(user.advisement == advisement){
        if(user.status != "offline")
          advnames.push("<span class='user-badge' data-username='"+user.username+"'>"+(user.username == username ? "<b>You</b>" : user.username)+" <img src='/images/statuses/status-"+user.status.toLowerCase().replace(" ", "")+".png'></span>");
        if(user.status == "offline" && user.username == username)
          advnames.push("<span class='user-badge text-muted' data-username='"+username+"'><b>You</b> </span>");
      }
    });

    $("#users-online").text(count+" user(s)");
    $(".online-badge span").text(count+" online");
    $(".online-badge").attr("data-content", names.join(', '));

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
    if(sessionStorage['user-status'].toLowerCase() == "in class")
      return;
    setStatus($(this).text().toLowerCase().trim());
    if(['in class', 'working', 'busy', 'offline'].indexOf($(this).text().toLowerCase()) > -1){
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
        message = linkify(message);

        var part = "<b class='user-badge' data-username='"+user+"'>"+user+": </b>";
        part += "<span title='"+when.fromNow()+" | "+when.format("dddd, MMMM Do YYYY, h:mm:ss a")+"'>"+message+"</span>";
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
    //messages.push({username: "fmatranga18", message: "SEPARATED", when: moment().subtract(20, 'hours')});
    showMessages();
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
  });

  var showMessages = function() {
    var html = '';
    for(var i=0; i<messages.length; i++) {
        var user = messages[i].username;
        var message = messages[i].message;
        var when = moment(messages[i].when);

        // Totally sanitizes the message
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(message));
        message = div.innerHTML;
        message = linkify(message);

        // If last message is from over 5 hours ago, add a separator
        try{if(moment(when).diff(messages[i - 1].when, 'hours') > 5){
            html+="<hr class='chat-divider'>";
        }}catch(e){}

        var part = "<b class='user-badge' data-username='"+user+"'>"+user+": </b>";
        part += "<span title='"+when.fromNow()+" | "+when.format("dddd, MMMM Do YYYY, h:mm:ss a")+"'>"+message+"</span><br>";
        html += part;
    }
    $("#chat-messages").html(html);
    $('#chat-messages').profanityFilter({
      externalSwears: '/swears.json'
    });
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

        if($("#chat-box").hasClass("shown") == false || document[hidden]){
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

function setStatus(status){
  if(!status)
    status = "available";

  sessionStorage['user-status'] = status;
  socket.emit('setstatus', {status: status.toLowerCase()});

  $("#status-circle").attr("src", "/images/statuses/status-"+status.toLowerCase().replace(" ", "")+".png");
  $("#user-status b").html(status+(status !== "In Class" ? "<span class='caret'></span>" : ""));
  console.log("Set status to "+status);
}

function setStatusNoLoop(stat){
  if(!stat)
    stat = "available";
  sessionStorage['user-status'] = stat;
  $("#status-circle").attr("src", "/images/statuses/status-"+stat.toLowerCase().replace(" ", "")+".png");
  $("#user-status b").html(stat+(stat !== "In Class" ? "<span class='caret'></span>" : ""));
}
