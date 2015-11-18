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
