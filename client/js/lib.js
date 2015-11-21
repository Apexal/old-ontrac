var App = function(){
  var _ = this;
  PNotify.desktop.permission();
  _.page = window.location.href.split("/")[3];
  _.loggedIn = false;
  _.originalTitle = $("title").text();

  // Get currently loggedIn user
  $.get("/api/loggedIn", function(data) {
    if(!data.error){
      _.currentUser = data;
      _.loggedIn = true;
    }else{
      sessionStorage.unread = 0;
      sessionStorage.advunread = 0;
    }
    console.log("[ Loading OnTrac JS... ]");
    if(_.loggedIn){
      console.log("Logged in as "+_.currentUser.username);

      // SOCKET.IO
      var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      _.socket = io.connect(full);
      _.onlineNow = [];

      _.socket.on('connect', function () {
        _.sessionId = _.socket.io.engine.id;
        console.log('Connected to Server');
      });
      _.socket.on('error', function (reason) {
        console.log('Unable to connect to server', reason);
      });

      _.status = sessionStorage['user-status'];
      if (!_.status || _.status == undefined){
        _.status = "available";
      }
    }
    console.log("[ Done. ]");
  });
}

App.prototype = {
  setStatus: function (status, emit) {
    if(!status)
      status = "available";

    var status = status.toLowerCase().trim();

    sessionStorage['user-status'] = status;
    if(emit)
      this.socket.emit('setstatus', {status: status});

    //$("#status-circle").attr("src", "/images/status-"+status.replace(" ", "")+".png");
    //$("#user-status b").html(status+(status !== "in class" ? "<span class='caret'></span>" : ""));
    console.log("Set status to "+status);
  },
  toggleMuted : function (){
    sessionStorage.muted = (sessionStorage.muted == "1" ? "0" : "1");
    if(sessionStorage.muted == "1"){
      //$("#mute-toggle").removeClass("fa-volume-up");
      //$("#mute-toggle").addClass("fa-volume-off");
    }else{
      //$("#mute-toggle").removeClass("fa-volume-off");
      //$("#mute-toggle").addClass("fa-volume-up");
    }
  },
  set_muted: function (to){
    if(to){
      sessionStorage.muted = 1;
      //$("#mute-toggle").removeClass("fa-volume-up");
      //$("#mute-toggle").addClass("fa-volume-off");
    }else{
      sessionStorage.muted = 0;
      //$("#mute-toggle").removeClass("fa-volume-off");
      //$("#mute-toggle").addClass("fa-volume-up");
    }
  },
  getWorkForDate: function (date){
    $.get("/homework/"+date, function(data) {
      if(!data.error){
        var hw = {};
        var hwTitles = [];
        var doneC = 0;
        var total = data.length;
        data.forEach(function(item){
          if(item.completed)
            doneC++;
          if(hwTitles.indexOf(item.course.title) == -1)
            hwTitles.push(item.course.title);

          if(!hw[item.course.title])
            hw[item.course.title] = [];

          hw[item.course.title].push(item);
        });
        var toReturn = {homework: {items: hw, percent: Math.floor(doneC/total)}};
        console.log(toReturn);
        return toReturn;
      }
    });
  }
}
