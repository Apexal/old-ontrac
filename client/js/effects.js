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
      coursebadges();
    }
    
    var clock = $("#clock");
    clock.text(moment().format('dddd [the] Do, h:mm a'));
    setInterval(function() {
      clock.text(moment().format('dddd [the] Do, h:mm a'));
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
                                reminders[reminder].added_date
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
    var loggingIn = false;
    $("#login-button").click(function() {
      var username = $("#username").val();
      var password = $("#password").val();
      if(!username || !password)
        return;

      $("#login-button").text("Logging in...");
      $("body").css("cursor", "wait");
      if(loggingIn == false){
        loggingIn = true;
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
                $("body").css("cursor", "auto");
                loggingIn = false;
            } else {
                window.location.href = $("#login-form").data(
                    "redirect");
            }
        });
      }
    });

    // FEEDBACK
    $("#feedback-form").submit(function(e) {
      e.preventDefault();
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
    if(window.location.href.indexOf("/schedule") > -1){
      $("main").css("height", "100%");
    }
    if(window.location.href.indexOf("chat") > -1){
      if(window.location.href.indexOf("/advisements/chat") > -1){
        $("main").css("padding-bottom", "170px");
      }
    }

    if($("#stars").length){
      $("#stars").position({my: "left bottom", at: "left bottom", of: "#profile-pic"});
      $("#rank").position({my: "right bottom", at: "right bottom", of: "#profile-pic"});
    }



}
