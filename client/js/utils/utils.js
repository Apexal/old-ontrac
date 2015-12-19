var linkify = function(text) {
  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function(url) {
      return '<a target="_blank" href="' + url + '">' + url + '</a>';
  });
}

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

function updateTooltips(){
  $('[data-toggle="tooltip"]').tooltip({animation: true, html: true});
  $('[data-toggle="popover"]').popover({html: true});
}

function updateTitle(){
  if(!sessionStorage.unread)
    sessionStorage.unread = 0;
  if(!sessionStorage.advunread)
    sessionStorage.advunread = 0;

  var toSet = ORIGINALTITLE + " (";

  if(Number(sessionStorage.unread) > 0){
    toSet += sessionStorage.unread+" unread";
    if($("#chat-box").length){
      $("#chat-box").removeClass("panel-default").addClass("panel-primary");
    }
  }else{
    if($("#chat-box").length){
      $("#chat-box").removeClass("panel-primary").addClass("panel-default");
    }
  }
  if(Number(sessionStorage.advunread) > 0){
    if(Number(sessionStorage.unread > 0))
      toSet += ", ";
    toSet+= sessionStorage.advunread+" advchat unread";
  }
  toSet+= ")";

  if(Number(sessionStorage.unread) == 0 && Number(sessionStorage.advunread) == 0)
    $("title").text(ORIGINALTITLE);
  else
    $("title").text(toSet);
}
