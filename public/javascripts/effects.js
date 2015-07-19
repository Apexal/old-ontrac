$(function() {

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







  $("#chat-controls").submit(function() {
    return false;
  });

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
      $("#chat-controls.small-box").show();
      $("#chat-messages.small-box").show();
      $(this).removeAttr('style');
      $("#chat-box.small-box").height("300px").width("400px").css("bottom", "70px");
      console.log("SHOW");
    }else{
      $("#chat-controls.small-box").hide();
      $("#chat-messages.small-box").hide();
      $("#chat-box.small-box").css({width: "250px", height: "40px", bottom: "30px"});
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
