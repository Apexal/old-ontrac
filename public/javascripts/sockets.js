$(function() {
  var socket = io.connect('http://'+document.domain+':3000');
  var username = $("#chat-box").data("username");

  socket.on('connect', function () {
    sessionId = socket.io.engine.id;
    console.log('Connected ' + sessionId);
  });
  socket.on('error', function (reason) {
    console.log('Unable to connect to server', reason);
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
        part = "<div class='panel panel-default message clearfix'>";
        if(messages[i].user == "server")
          part += "<img src='http://icons.iconarchive.com/icons/igh0zt/ios7-style-metro-ui/512/MetroUI-Folder-OS-OS-Linux-icon.png'>";
        else
          part += "<img src='https://webeim.regis.org/photos/regis/Student/"+messages[i].code+".jpg'>";
        part += "<small title='"+moment(messages[i].date).format("dddd, MMMM Do YYYY, h:mm:ss a")+"'class='right'>"+moment(messages[i].date).fromNow()+"</small>";
        part += "<div class='padded clearfix'>"
        part += "<b>"+messages[i].name+" <a href='/users/"+messages[i].user+"'>("+messages[i].user+")</a></b><br>";

        part += "<span>"+messages[i].message+"</span>";
        part += "</div>";
        part += "</div>";
        html += part;
    }
    $("#chat-messages").html(html);
    $("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
  }

  var messages = [];
  socket.on('message', function (data) {
    if(data.message) {
        messages.push(data);
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

});
