$(function() {
  var username = $('#send-message').data("username");
  // Prevent disabled nav links from being clicked
  $(".nav li.disabled a").click(function() {
     return false;
   });

  // Use the API to get user info for each user badge present on the page

    /*$('.user-badge').tooltipster({
      content: 'Loading...',
      interactive: true,
      theme: 'tooltipster-shadow',
      functionBefore: function(origin, continueTooltip) {
        continueTooltip();
        var username = origin.text();
        if (origin.data('ajax') !== 'cached') {
          $.ajax({
            type: 'GET',
            url: "/api/user/"+username,
            success: function(data) {
              var content = "";
              if(data.code != "Uknown")
                content+="<img src='https://webeim.regis.org/photos/regis/Student/"+data.code+".jpg'>";
              content += "<b>"+data.firstName+" "+data.lastName+"</b> of <b>"+data.advisement+"</b>";// update our tooltip content with our returned data and cache it
              origin.tooltipster('content', $(content)).data('ajax', 'cached');
            },
            dataType: "json"
          });
        }
      }
    });*/

  (function user_badges(){
    $(".user-badge").click(function() {
      var username = $(this).data("username");

      if($("#"+username+"-modal").length == 0){
        $.ajax({
          type: 'GET',
          url: "/api/user/"+username,
          success: function(data) {
            if(data != "Not authorized."){
              var title = data.firstName + " " + data.lastName;
              console.log(data);
              var coursenames = ['None!'];
              if(data.courses.length > 0){
                coursenames=[];
                for(c in data.courses){
                  coursenames.push(data.courses[c].title);
                }
              }
              var imgsrc = (data.registered ? "https://webeim.regis.org/photos/regis/Student/"+data.code+".jpg" : data.mpicture);

              var bio = (data.bio ? data.bio : "Not set yet!");

              var adv = data.advisement.charAt(0);
              var grade = "";
              switch(adv) {
                case "1":
                  grade = "Frosh";
                  break;
                case "2":
                  grade = "Soph.";
                  break;
                case "3":
                  grade = "Junior";
                  break;
                case "4":
                  grade = "Senior";
                  break;
              }

              // TODO: this thing...
              var content = $("<div class='modal fade user-modal' id='"+username+"-modal' tabindex='-1'>" +
                    "        <div class='modal-dialog'>" +
                    "            <div class='modal-content'>" +
                    "                <div class='modal-header'>" +
                    "                    <button class='close' data-dismiss='modal' type=" +
                    "                    'button'><span>&times;</span></button>" +
                    "                    <h4 class='modal-title'>User" +
                    "                    Summary</h4>" +
                    "                </div>" +
                    "                <div class='modal-body'>" +
                                      "<div class='container-fluid'>" +
                                      "    <div class='row'>" +
                                      "        <div class='col-xs-12 col-sm-3 center'>" +
                                      "            <img class='modal-pic' title='Looking good!' src='"+imgsrc+"'>" +
                                      "            <br><b>"+data.points+" points</b>" +
                                      "        </div>" +
                                      "        <div class='col-xs-12 col-sm-9'>" +
                                      "             <h3 class='no-margin'><b>"+grade+"</b> "+data.firstName + " " +data.lastName+" of <b>"+data.advisement+"</b></h3><br>" +
                                      "             <div class='well well-sm'>" +
                                      "                 <b>Bio: </b><span>"+bio + "</span><br>" +
                                      "                 <b>Classes: </b><span>"+coursenames.join(',  ')+"</span>" +
                                      "             </div>" +
                                      "        </div>" +
                                      "    </div>" +
                                      "</div>"+
                    "                </div>" +
                    "                <div class='modal-footer'>" +
                    "                    <button class='btn btn-default' data-dismiss='modal' type=" +
                    "                    'button'>Close</button> <a class='btn btn-primary'" +
                    "                    href='/users/"+username+"'>View Full Profile</a>" +
                    "                </div>" +
                    "            </div>" +
                    "        </div>" +
                    "    </div>");

              $("body").append(content);
              $("#"+username+"-modal").modal();
            }
          }
        });
      }else{
        $("#"+username+"-modal").modal();
      }
    });

  })();


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



});
