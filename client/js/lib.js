var stack_bottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};

var title=$("title").text();
function updateTitle(){

  if(!sessionStorage.unread)
    sessionStorage.unread = 0;
  if(!sessionStorage.advunread)
    sessionStorage.advunread = 0;
        
  var toSet = title + " (";

  if(Number(sessionStorage.unread) > 0)
    toSet += sessionStorage.unread+" unread";
  if(Number(sessionStorage.advunread) > 0){
    if(Number(sessionStorage.unread > 0))
      toSet += ", ";
    toSet+= sessionStorage.advunread+" advchat unread";
  }
  toSet+= ")";

  if(Number(sessionStorage.unread) == 0 && Number(sessionStorage.advunread) == 0)
    $("title").text(title);
  else
    $("title").text(toSet);
}

function sendNotification(ntype, title, text){
  var opts = {
      text: text,
      addclass: "stack-bottomright",
      stack: stack_bottomright,
      styling: 'bootstrap3',
      icon: false,
      type: ntype
  };
  new PNotify(opts);
}

$(function() {
  console.log("Loaded JS");
  updateTitle();
  effects();
  days();
  if($('#send-message').data("username") !== undefined){
    sockets();
  }
});
