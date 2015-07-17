$(function() {
  //localStorage["show-chat"] = 0;
    console.log(localStorage["show-chat"]);

    $( "#chat-box.resizable" ).resizable({
      maxHeight: 550,
      maxWidth: 650,
      minHeight: 250,
      minWidth: 400,
      handles: 'n'
    });

    var set_chat = function(show) {
      if(show == 1){
        $("#chat-controls").show();
        $("#chat-messages").show();
        $(this).removeAttr('style');
        $("#chat-box").height("300px").width("400px").css("bottom", "70px");
        console.log("SHOW");
      }else{
        $("#chat-controls").hide();
        $("#chat-messages").hide();
        $("#chat-box").css({width: "250px", height: "40px", bottom: "30px"});
        console.log("HIDE");
      }
      localStorage["show-chat"] = show;
      console.log(localStorage["show-chat"]);
    };

    if(localStorage['show-chat'] == false){
      set_chat(0);
    }

    $("#toggle-chat").click(function() {
      var show = (localStorage['show-chat'] == 1 ? 0 : 1);
      set_chat(show);
    });
});
