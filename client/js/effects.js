function effects() {
    var title = $("title");
    username = $('#send-message').data("username");
    loggedIn = (username !== undefined);
    // Prevent disabled nav links from being clicked
    $(".nav li.disabled a").click(function() {
        return false;
    });
    if (username) {
        userbadges();
        teacherbadges();
    }

    $('[data-toggle="tooltip"]').tooltip();

    var clock = $("#clock");
    clock.text(moment().format('MMMM Do YYYY, h:mm:ss a'));
    setInterval(function() {
      clock.text(moment().format('MMMM Do YYYY, h:mm:ss a'));
    }, 1000);

    var today = moment().format("YYYY-MM-DD");
    if($("#work-tab").length > 0){
      //alert("AYY");
      $.get('/api/work/'+today, function(data){
        if(data.work){
          $("#todays-work").show();
          if(data.work.homework.length > 0){
            var hw = data.work.homework;
            var counts = {};
            for(var t in data.work.homework){
              if(counts[hw[t].course.title])
                counts[hw[t].course.title] += 1;
              else
                counts[hw[t].course.title] = 0;
            }
          }

          //$("#todays-work").text(data.work.toString());
        }
      });
    }

    // Animate the knobs to random percentages (for now)
    // TODO: remove this when I finish the view
    $('.dial').each(function() {
        var elm = $(this);
        //var percent = elm.attr("value");
        var percent = Math.floor((Math.random() * 90) + 10);
        elm.knob({
            'value': 0,
            'format': function(value) {
                return value + '%';
            }
        });
        $({
            value: 0
        }).animate({
            value: percent
        }, {
            duration: 1000,
            easing: 'swing',
            progress: function() {
                elm.val(Math.ceil(this.value)).trigger(
                    'change');
            }
        });
    });
    // Prevent the chat form from sending data and refreshing the page
    $("#chat-controls").submit(function() {
        return false;
    });
    // Make the  small chat box resizable with default values


    /*
    $("#chat-box.resizable").resizable({
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
        if (show == 1) {
            small_box.show();
            small_box2.show();
            $(this).removeAttr('style');
            chat_box.height("300px").width("400px").css("bottom",
                "43px");
            $("#chat-box").data("hidden", "false");
            sessionStorage.unread = 0;
        } else {
            small_box.hide();
            small_box2.hide();
            chat_box.css({
                width: "250px",
                height: "40px",
                bottom: "0px"
            });
            $("#chat-box").data("hidden", "true");

        }
        localStorage["show-chat"] = show;
    };
    if (localStorage['show-chat'] == false) {
        set_chat(0);
    }

    $("#toggle-chat").click(function() {
        var show = (localStorage['show-chat'] == 1 ? 0 : 1);
        set_chat(show);
        updateTitle();
    });
    */

    if (sessionStorage['show-chat'] == "1") {
      $("#chat-box").addClass("shown");
    }

    $("#toggle-chat").click(function() {
      $("#chat-box").toggleClass("shown");
      if(Number(sessionStorage['show-chat']) == 1){
        sessionStorage['show-chat'] = 0;
      }else{
        sessionStorage['show-chat'] = 1;
        sessionStorage.unread = 0;
      }
      updateTitle();
    });

    // REMINDERS
    function reminders() {
        var reminders = [];
        if (username) {
            $.get("/reminders/all", function(data) {
                if (data.reminders && data.reminders.length !==
                    0) {
                    reminders = data.reminders;
                    $("#reminder-table tr").remove();
                    for (var reminder in reminders) {
                        $("#reminder-table").append(
                            "<tr class='reminder' data-id='" +
                            reminders[reminder]._id +
                            "'><td title='Added " + moment(
                                reminders[reminder].date_added
                            ).fromNow() + "'>" + reminders[
                                reminder].desc +
                            "</td></tr>");
                    }
                } else {
                    $("#reminder-table tr").remove();
                    $("#reminder-table").append(
                        "<tr><td class='center'>No reminders!</td></tr>"
                    );
                }
                if (reminders.length === 0) {
                    $("#reminders-count").hide();
                } else {
                    $("#reminders-count").show();
                    $("#reminders-count").html("&nbsp;"+reminders.length+"&nbsp;");
                }
                $(".reminder").click(removeReminder);
            });
        }
    }
    reminders();
    var removeReminder = function() {
        console.log("click");
        if (confirm("Remove this reminder?")) {
            var id = $(this).data("id");
            $.post("/reminders/remove", {
                id: id
            }, function(data) {
                if (data.success === true) {
                    reminders();
                }
            });
        }
    };
    $("#reminder-form").submit(function() {
        return false;
    });
    $("#add-reminder").click(function() {
        if ($("#reminder-desc").val()) {
            $.post("/reminders/add", { // I <3 POST
                desc: $("#reminder-desc").val()
            }, function(data) {
                if (data.success === true) {
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
        $("#login-button").text("Logging in...");
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
            } else {
                window.location.href = $("#login-form").data(
                    "redirect");
            }
        });
        return false;
    });

    // FEEDBACK
    $("#feedback-form").submit(function() {
        return false;
    });
    $("#send-feedback").click(function() {
        var type = $("#feedback-type").val();
        var text = $("#feedback-text").val();
        if (type && text) {
            //alert(type + " " + text);
            $.post("/api/feedback/send", {
                feedbackType: type,
                text: text
            }, function(data) {
                if (data.success === true) {
                    console.log("Good!");
                    $("#feedback-text").val("");
                    $("#feedback-modal").modal("hide");
                }
            });
        }
    });

    // When on the schedule page, make the main tag full height so that the schedule iframe is full height
    if(window.location.href.indexOf("/schedule") > -1 || window.location.href.indexOf("/advisements/chat") > -1){
      $("main").css("height", "100%");
      if(window.location.href.indexOf("/advisements/chat") > -1){
        $("main").css("padding-bottom", "170px");
      }
    }

    if($("#stars").length){
      $("#stars").position({my: "left bottom", at: "left bottom", of: "#profile-pic"});
      $("#rank").position({my: "right bottom", at: "right bottom", of: "#profile-pic"});
    }


    // HOMEPAGE CLASS INFO
    function updateHomepageSchedule(){
      content = "";

      $.get("/api/user/"+username, function(data) {
        if(data){
          $("#classInfo").html("");
          $("#schedule-table td").removeClass("sucess");

          var sInfo = data.sInfo;
          jS = sInfo.justStarted;
          //console.log(sInfo);
          if(sInfo.nowClass !== false){
            if(sInfo.nowClass == "between"){
              content += "<p class='larger no-margin'><b>"+sInfo.justEnded.className+"</b> has just ended.</p>";
              if(jS != false){
                content += "<h2 class='no-margin'>Get to <b>Room"+jS.room+"</b> for <b>"+jS.className+"</b></h2>";
                $("#schedule-table td:contains('"+jS.className+"')").parent().addClass("success");
              }
            }else if(sInfo.nowClass.className == "Unstructured Time") {
              // FREE PERIOD
              content += "You currently have a <b>Free Period</b> for <b>"+moment(sInfo.nowClass.endTime).fromNow(true)+"</b>";
            }else{
              // Regular class
              content += "<h2>You should currently be in <b>Room "+sInfo.nowClass.room+"</b> for <b>"+sInfo.nowClass.className+"</b></h2>";
            }
            $("#schedule-table tbody tr td:contains('"+sInfo.nowClass.className+"')").parent().addClass("success");
            if(sInfo.nextClass !== false){
              content += "<p class='larger'>Your next class is <b>"+sInfo.nextClass.className+"</b> in <b>Room "+sInfo.nextClass.room+"</b> in <b>"+moment(sInfo.nextClass.startTime).fromNow(true)+"</b></p>";
            }else{
              if(sInfo.nowClass !== "between")
                content += "<p class='larger'>This is the last class of your day!</p>";
            }



            content += "<hr>";
            $("#classInfo").html(content);
          }
        }
      });
    }

    if($("#classInfo").length){
      updateHomepageSchedule();
      setInterval(updateHomepageSchedule, 60000);
    }
}
