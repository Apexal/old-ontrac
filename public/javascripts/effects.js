$(function() {
  var username = $('#send-message').data("username");
  // Prevent disabled nav links from being clicked
  $(".nav li.disabled a").click(function() {
     return false;
   });

  if(username){
    userbadges();
    teacherbadges();
  }


  // Animate the knobs to random percentages (for now)
  // TODO: remove this when I finish the view
  $('.dial').each(function () {
    var elm = $(this);
    //var percent = elm.attr("value");
    var percent = Math.floor((Math.random() * 90) + 10);
    elm.knob({
      'value': 0,
      'format': function (value) {
        return value + '%';
      }
    });
    $({value: 0}).animate({ value: percent }, {
      duration: 1000,
      easing: 'swing',
      progress: function () {
        elm.val(Math.ceil(this.value)).trigger('change')
      }
      });
    });


  // Prevent the chat form from sending data and refreshing the page
  $("#chat-controls").submit(function() {
    return false;
  });

  // Make the  small chat box resizable with default values
  $( "#chat-box.resizable" ).resizable({
    maxHeight: 550,
    maxWidth: 650,
    minHeight: 250,
    minWidth: 400,
    handles: 'n'
  });


  // Toggle the small chat box
  var chat_box = $("#chat-box.small-box");
  var small_box = $("#chat-controls.small-box");
  var small_box2 = $("#chat-messages.small-box");
  var set_chat = function(show) {
    if(show == 1){
      small_box.show();
      small_box2.show();
      $(this).removeAttr('style');
      chat_box.height("300px").width("400px").css("bottom", "43px");
    }else{
      small_box.hide();
      small_box2.hide();
      chat_box.css({width: "250px", height: "40px", bottom: "0px"});
    }
    localStorage["show-chat"] = show;
  };

  if(localStorage['show-chat'] == false){
    set_chat(0);
  }

  $("#toggle-chat").click(function() {
    var show = (localStorage['show-chat'] == 1 ? 0 : 1);
    set_chat(show);
  });









  // REMINDERS
  function reminders(){
    var reminders = [];
    if(username){
      $.get("/reminders/all", function(data){
        if(data.reminders && data.reminders.length != 0){
          reminders = data.reminders;

          $("#reminder-table tr").remove();
          for(reminder in reminders){
            $("#reminder-table").append("<tr class='reminder' data-id='"+reminders[reminder]._id+"'><td title='Added "+moment(reminders[reminder].date_added).fromNow()+"'>"+reminders[reminder].desc+"</td></tr>");
          }
        }else{
          $("#reminder-table tr").remove();
          $("#reminder-table").append("<tr><td class='center'>No reminders!</td></tr>");
        }
        if(reminders.length == 0){
          $("#reminders-count").hide();
        }else{
          $("#reminders-count").show();
          $("#reminders-count").text(reminders.length);
        }

        $(".reminder").click(removeReminder);
      });
    }
  }
  reminders();


  var removeReminder = function() {
    console.log("click");
    if(confirm("Remove this reminder?")){
      var id = $(this).data("id");
      $.post("/reminders/remove", {id: id}, function(data) {
        if(data.success == true){
          reminders();
        }
      });
    }
  }

  $("#reminder-form").submit(function(){return false;});
  $("#add-reminder").click(function() {
    if($("#reminder-desc").val()){
      $.post("/reminders/add", {desc: $("#reminder-desc").val()}, function(data) {
        if(data.success == true){
          reminders();
          $("#reminder-desc").val("");
        }
      });
    }
  });


  // LOGIN MODAL FORM
  $("#login-form").submit(function() {
    var username = $("#username").val();
    var password = $("#password").val();
    $.post("/login", {username: username, password: password}, function(data) {
      $("#login-errors b").remove();
      if(data.errors){
        for (err in data.errors){
          $("#login-errors").append("<b class='text-danger'>"+data.errors[err]+"</b><br>");
        }
      }else{
        window.location.href=$("#login-form").data("redirect");
      }
    });
    return false;
  });




  // FEEDBACK
  $("#feedback-form").submit(function(){return false;});

  $("#send-feedback").click(function() {
    var type = $("#feedback-type").val();
    var text = $("#feedback-text").val();
    if(type && text){
      //alert(type + " " + text);
      $.post("/feedback/send", {feedbackType: type, text: text}, function(data) {
        if(data.success == true){
          console.log("Good!");
        }
      });
    }
  });

});
