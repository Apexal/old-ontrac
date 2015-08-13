$(function() {

  // Prevent disabled nav links from being clicked
  $(".nav li.disabled a").click(function() {
     return false;
   });

  // Use the API to get user info for each user badge present on the page
  if($('.user-badge').length){
    $('.user-badge').tooltipster({
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
    });
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


  $("#add-reminder").click(function() {
    var reminder = prompt("New reminder: ");
    
  });
});
