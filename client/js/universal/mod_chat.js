var messages = [];
var chat_notification = new Audio('/sounds/ding.mp3');

modules.push({
  name: "global-chat",
  check: function() {
    return loggedIn;
  },
  run: function() {
    localStorage['filterProfanity'] = (localStorage['filterProfanity'] ? localStorage['filterProfanity'] : "on");

    var filter = $("#filter-toggle");
    if(localStorage['filterProfanity'] == "on")
      filter.css('color', '#222');
    else
      filter.css('color', 'grey');

    var toggle_filter = function() {
      localStorage['filterProfanity'] = (localStorage['filterProfanity'] == "off" ? "on" : "off");

      if(localStorage['filterProfanity'] == "on")
        filter.css('color', '#222');
      else
        filter.css('color', 'grey');

      showMessages();
    }
    filter.click(toggle_filter);

    var toggle_muted = function(){
      sessionStorage.muted = (sessionStorage.muted == "1" ? "0" : "1");
      if(sessionStorage.muted == "1"){
        $("#mute-toggle").removeClass("fa-volume-up");
        $("#mute-toggle").addClass("fa-volume-off");
      }else{
        $("#mute-toggle").removeClass("fa-volume-off");
        $("#mute-toggle").addClass("fa-volume-up");
      }
    }

    set_muted = function(to){
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

    var handleVisibilityChange = function() {
      if (document[hidden]) {
        //console.log("HIDE TAB");
      } else {
        if($("#chat-box").hasClass("shown"))
          sessionStorage.unread = "0";
        updateTitle();
        //console.log("SHOWED TAB");
        if(typeof updateDayInfo == 'function' && todayInfo !== undefined) updateDayInfo();
      }
    }
    document.addEventListener(visibilityChange, handleVisibilityChange, false);


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
      $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    });

    var createMessageHTML = function(m, lastSender){
      var toReturn = [];
      var message = m.message;
      var when = moment(m.when);

      if(m.username == "server"){
        toReturn.push("<span title='"+when.fromNow()+" | "+when.format("dddd, MMMM Do YYYY, h:mm:ss a")+"' class='text-muted'>"+message+"</span><br>");
      }else{
        var user = m.username;
        // Totally sanitizes the message
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(message));
        message = div.innerHTML;
        message = linkify(message);

        var words = message.split(" ");
        message = "";
        words.forEach(function(word) {
          var toAdd = word;
          if(word.indexOf("@") == 0 && word !== "@"){
            var badge = word.replace("@", "");
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(badge));
            badge = div.innerHTML;
            toAdd = "<b class='user-badge' data-username='"+badge+"'>@"+badge+"</b>";
          }
          message += toAdd+" ";
        });
        message = message.trim();

        // If last message is from over 5 hours ago, add a separator
        try{if(moment(when).diff(messages[i - 1].when, 'hours') > 5){
            toReturn.push("<hr class='chat-divider'>");
        }}catch(e){}

        toReturn.push("<div class='message "+(user==currentUser.username ? "you" : "")+"'>");
        if(lastSender !== user)
          toReturn.push("<b class='user-badge' data-username='"+user+"'>"+user+": </b>");

        toReturn.push("<span title='"+when.fromNow()+"'>"+message+"</span></div>");
      }

      return toReturn.join('');
    }

    var showMessages = function() {
      var scrollPos = $("#chat-messages")[0].scrollHeight - $("#chat-messages").scrollTop();

      var html = [];
      var lastSender = "";
      for(var i=0; i<messages.length; i++) {
        html.push(createMessageHTML(messages[i], lastSender));
        lastSender = messages[i].username;
      }
      $("#chat-messages").html(html.join(""));

      if(localStorage['filterProfanity'] == "on"){
        $('#chat-messages').profanityFilter({
          externalSwears: '/swears.json'
        });
      }

      if(scrollPos == $("#chat-messages").outerHeight()){
        $("#chat-messages").scrollTop(100000);
        $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
      }

      personbadges();
    };

    socket.on('message', function (data) {
      if(data.message) {
          messages.push(data);
          if(data.username !== username && data.ignore !== username){
            if(sessionStorage.muted == "0")
              chat_notification.play();

            if(!sessionStorage.unread)
              sessionStorage.unread = 0;

            if($("#chat-box").hasClass("shown") == false || document[hidden]){
              sessionStorage.unread = Number(sessionStorage.unread)+1;
            }else{
              sessionStorage.unread = 0;
            }
            updateTitle();
          }

          var scrollPos = $("#chat-messages")[0].scrollHeight - $("#chat-messages").scrollTop();
          var lastSender = '';
          if(messages.indexOf(data) - 1 >= 0 )
            lastSender = messages[messages.indexOf(data) - 1].username;

          $("#chat-messages").append(createMessageHTML(data, lastSender));

          if(localStorage['filterProfanity'] == "on"){
            $('#chat-messages').profanityFilter({
              externalSwears: '/swears.json'
            });
          }

          if(scrollPos == $("#chat-messages").outerHeight()){
            $("#chat-messages").scrollTop(100000);
            $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
          }

          personbadges();
      } else {
          console.log("There is a problem:", data);
      }
    });

    var sendMessage = function() {
      var message = $('#chat-message').val();
      socket.emit("message", {message: message, when: moment().toDate()});
      $('#chat-message').val('');
      $("#chat-messages").scrollTop(100000);
      $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
    }

    var outgoingMessageKeyDown = function(event) {
      if (event.which == 13) {
        if ($('#chat-message').val().trim().length <= 0) {
          return;
        }
        sendMessage();
        $('#chat-message').val('');
      }
    }

    var outgoingMessageKeyUp = function() {
      var message = $('#chat-message').val();
      $('#send-message').attr('disabled', (message.trim()).length > 0 ? false : true);
    }

    $('#chat-message').on('keydown', outgoingMessageKeyDown);
    $('#chat-message').on('keyup', outgoingMessageKeyUp);
    $('#send-message').on('click', sendMessage);


    $("#chat-controls").submit(function(e) {
      e.preventDefault();
      return false;
    });

    if (sessionStorage['show-chat'] == "1") {
      $("#chat-box").addClass("shown");
      $("#toggle-chat").removeClass("fa-chevron-up");
      $("#toggle-chat").addClass("fa-chevron-down");
    }

    $("#toggle-chat").click(function() {

      $("#chat-box").toggleClass("shown");
      if(Number(sessionStorage['show-chat']) == 1){
        sessionStorage['show-chat'] = 0;
        $("#toggle-chat").removeClass("fa-chevron-down");
        $("#toggle-chat").addClass("fa-chevron-up");
      }else{
        sessionStorage['show-chat'] = 1;
        sessionStorage.unread = 0;
        $("#toggle-chat").removeClass("fa-chevron-up");
        $("#toggle-chat").addClass("fa-chevron-down");
      }
      $("#chat-messages").scrollTop(100000);
      $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
      updateTitle();
    });

    setTimeout(showMessages, 300000);
  }
});
