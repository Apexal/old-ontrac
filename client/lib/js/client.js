var modules = [];

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

//INIT
console.log("[ Loading OnTrac JS ]");
PAGE = window.location.pathname;
ORIGINALTITLE = $("title").text();
loggedIn = false;
// ------------------------------

// EDGE CHECK
if(navigator.userAgent.indexOf('Edge') > -1){
  // in Edge the navigator.appVersion does not say trident
  alert("Unfortunately, OnTrac does not yet work on Microsoft Edge. I am looking into this. Please use Chrome or Firefox for now.");
}

$(function() {
  PNotify.desktop.permission();

  $(".nav li.disabled a").click(function() {
      return false;
  });

  // Get currently loggedIn user
  $.get("/api/loggedIn", function(data) {
    if(!data.error){
      currentUser = data;
      username = currentUser.username;
      loggedIn = true;
      $("span.badge.odometer").text(currentUser.points);
      console.log("[ Logged in as "+username+" ]");
      var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      socket = io.connect(full);

      socket.on('connect', function () {
        sessionId = socket.io.engine.id;
        console.log('Connected ' + sessionId);
      });
      socket.on('error', function (reason) {
        console.log('Unable to connect to server', reason);
      });
      socket.on('refresh', function(data) {
        location.reload();
      });
      socket.on('connect_error', function (err) {
        location.reload();
      });
      socket.on('new-logout', function(data) {
        if(data.username == currentUser.username){
          location.reload();
        }
      });
    }else{
      sessionStorage.unread = 0;
      sessionStorage.advunread = 0;
    }
    modules.sort(function(a, b) {
      if (a.name < b.name)
        return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    });
    modules.forEach(function(module) {
      if(module.check()){ console.log("[ Running "+module.name+"]"); module.run(); }
    });
    updateTooltips();
    console.log("[ DONE ]");

    setTimeout(location.reload, 1000 * 60 * 60 * 2);
  });
});
