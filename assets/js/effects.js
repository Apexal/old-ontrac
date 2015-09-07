function effects() {
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
        } else {
            small_box.hide();
            small_box2.hide();
            chat_box.css({
                width: "250px",
                height: "40px",
                bottom: "0px"
            });
        }
        localStorage["show-chat"] = show;
    };
    if (localStorage['show-chat'] == false) {
        set_chat(0);
    }
    $("#toggle-chat").click(function() {
        var show = (localStorage['show-chat'] == 1 ? 0 : 1);
        set_chat(show);
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
            $("#login-errors b").remove();
            if (data.errors) {
                for (var err in data.errors) {
                    $("#login-errors").append(
                        "<b class='text-danger'>" +
                        data.errors[err] + "</b><br>");
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

    $("#loginas-form").submit(function(e) {
      return false; // Prevents the request
    });
    $("#loginas-button").click(function() {
      window.location.href = "/loginas?user="+$("#loginas-username").val();
    });

    // When on the schedule page, make the main tag full height so that the schedule iframe is full height
    if(window.location.href.indexOf("/schedule") > -1){
      $("main").css("height", "100%");
    }


    /* =========================================================================
    *                             NOTIFICATION SYSTEM
    * ========================================================================== */

    
}
