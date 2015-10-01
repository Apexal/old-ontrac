var stack_bottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};

// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

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
  var page = window.location.href.split("/")[3];
  console.log("Loaded JS");
  updateTitle();
  effects();
  days();
  if($('#send-message').data("username") !== undefined){
    sockets();
    clientSchedule();
    console.log(page);
    if(page == "work"){
      workPage();
    }
  }
});
