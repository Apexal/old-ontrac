modules.push({
  name: "schedule",
  check: function() {
    return (loggedIn);
  },
  run: function() {
    // HOMEPAGE CLASS INFO
    todayInfo = false;
    userInfo = false;
    schedule = false;

    var updateHomepageInfo = function (){
      var content = "<hr>";

      if(schedule){
        var cInfo = schedule;
        $("#classInfo").html("");
        $("#cInfo-table tr").removeClass("sucess");

        //console.log(sInfo);
        if(cInfo.nowClass !== false){
          if(cInfo.nowClass.className == "Unstructured Time" && sessionStorage['user-status'] == "in class"){
            sessionStorage['user-status'] = "available";
            sendStatus();
          }else if(cInfo.nowClass.className !== "Unstructured Time"){
            sessionStorage['user-status'] = "in class";
            sendStatus();
          }

          if(cInfo.justEnded !== false){
            content += "<p class='larger no-margin'><b>"+cInfo.justEnded.className+"</b> has just ended.</p>";
            if(cInfo.justStarted){
              content += "<h2 class='no-margin'>Get to <b>"+cInfo.nowClass.room+"</b> for <b>"+cInfo.nowClass.className+"</b></h2>";
            }
          }else if(cInfo.nowClass.className == "Unstructured Time") {
            // FREE PERIOD
            content += "You currently have a <b>Free Period</b> for <b>"+moment(cInfo.nowClass.endTime, "hh:mm A").fromNow(true)+"</b>";
          }else{
            // Regular class
            content += "<h2>You should currently be in <b>"+cInfo.nowClass.room+"</b> for <b>"+cInfo.nowClass.className+"</b></h2>";
          }
          $("#cInfo-table tbody tr td:contains('"+moment(cInfo.nowClass.className, "hh:mm A").format("h:mm A")+"')").parent().addClass("success");
          if(cInfo.nextClass !== false && cInfo.nextClass.className !== "Afternoon Advisement"){
            content += "<p class='larger'>Your next class is <b>"+cInfo.nextClass.className+"</b> in <b>"+cInfo.nextClass.room+"</b> in <b>"+moment(cInfo.nextClass.startTime, "hh:mm A").fromNow(true)+"</b></p>";
          }else{
            content += "<p class='larger'>This is the last class of your day!</p>";
          }

          $("#classInfo").html(content);
        }else{
          // out of school
          if(sessionStorage['user-status'].toLowerCase() == "in class"){
            sessionStorage['user-status'] = "available";
            sendStatus();
          }
        }
      }else{
        if(sessionStorage['user-status'].toLowerCase() == "in class"){
          sessionStorage['user-status'] = "available";
          sendStatus();
        }
      }
    }

    var updateSidebarClassInfo = function (){
      var content = "";
      if(schedule){
        var cInfo = schedule;
        if(cInfo.nowClass !== false){
          $("#sidebar-class-info").show();
          $("#period-countdown").show();
          if(cInfo.nowClass.className == "Unstructured Time") {
            // FREE PERIOD
            $("#sidebar-now-class").text("Free Period");
          }else{
            // Regular class
            var cTitle = cInfo.nowClass.className;
            if(cTitle.indexOf(")") > -1)
              cTitle = cTitle.split(")")[0] +")";
            $("#sidebar-now-class").text(cTitle);
            $("#nowclass-room").text(cInfo.nowClass.room);
          }

          $("#todays-schedule li").removeClass("list-group-item-success");
          $("#todays-schedule li[data-mID='"+cInfo.nowClass.mID+"']").addClass("list-group-item-success");

          $("#period-countdown h3").text(moment(cInfo.nowClass.endTime, "hh:mm A").fromNow(true));

          if(cInfo.nextClass !== false && cInfo.nextClass.className !== "Afternoon Advisement"){
            $("#sd-nextc").show();
            $("#sidebar-next-class").text(cInfo.nextClass.className.split(")")[0]+")");
            if(cInfo.nextClass.room !== "Anywhere")
              $("#nextclass-room").text(cInfo.nextClass.room);
          }else{
            $("#sd-nextc").hide();
          }
        }else{
          $("#sidebar-class-info").hide();
          $("#period-countdown").hide();
        }
      }else{
        if(sessionStorage['user-status'].toLowerCase() == "in class"){
          sessionStorage['user-status'] = "available";
          sendStatus();
        }
      }
    }

    var hasClasses = false;
    var registered = true;
    var profileUserInfo = null;
    var updateProfileSchedule = function (){
      var profileUsername = window.location.href.split("/")[4];
      if(!profileUserInfo){
        $.get('/users/api/'+profileUsername, function(data){
          if(data){
            registered = data.registered;
            if(data.registered == false){
              $("#profile-schedule").hide();
              return;
            }
            hasClasses = true;
            profileUserInfo = data;
            updateProfileSchedule();
          }
        });
      }else{
        var cInfo = getCurrentClassInfo(profileUserInfo.todaysClassesInfo.periods);
        if(cInfo.inSchool == true && cInfo !== false){
          if(cInfo.nowClass !== false){
            $("#profile-schedule").show();
            $("#profile-schedule p").html("<b>"+profileUserInfo.firstName+"</b> currently has <b>"+cInfo.nowClass.className+"</b> in <b>"+cInfo.nowClass.room+"</b> until <b>"+moment(cInfo.nowClass.endTime, "hh:mm A").format("h:mm A")+"</b>");
          }
        }else{
          $("#profile-schedule").hide();
        }
      }
    }


    var sendabout = "";
    updateDayInfo = function (){
      if(todayInfo == undefined)
        return;

      schedule = getCurrentClassInfo(todayInfo.periods);
      var title = "Class has just Ended!";

      if(schedule.justStarted && schedule.nowClass.room !== sendabout){
        var n = schedule.nowClass;
        var text = "Next is "+n.className+" in "+n.room;
        if(schedule.justEnded == false){
          "Get to "+n.room+" for "+n.className+".";
        }
        if(n.className == "Unstructured Time")
          text = "You now have a free until "+n.endTime+"!";
        sendDesktopNotification("info", title, text);
        sendabout = n.room;
      }

      if($("#classInfo").length)
        updateHomepageInfo();

      if($("#profile-schedule").length && registered)
        updateProfileSchedule();

      updateSidebarClassInfo();
    }

    // Return an the scheduleobject for today with the periods filled in.
    var getCurrentClassInfo = function(periods){
      var mom = moment();
      var dayStart = moment("08:40 AM", "hh:mm A");
      var dayEnd = moment("02:50 PM", "hh:mm A");

      var now = false;
      var next = false;
      var justEnded = false;
      var justStarted = false;
      var inSchool = false;

      if(periods !== false && mom.isBetween(dayStart, dayEnd)){
        inSchool = true;
        // THERE ARE CLASSES SCHEDULED FOR TODAY

        // Loop through today's classes to find the currently ongoing
        now = periods.filter(function(period) {
          if(mom.isBetween(moment(period.startTime, "hh:mm A"), moment(period.endTime, "hh:mm A"))){
            return true;
          }
          return false;
        });
        if(now.length >= 1) now = now[0];
        // If there is no such period (and it is during the school day)

        // Try to find a class that just ended
        var cur = mom;
        var found = periods.filter(function(period) {
          var ended = moment(period.endTime, "hh:mm A");
          var buffer = moment(ended).add(3, 'minutes'); // Start of next period with buffer time
          if(cur.isBetween(ended, buffer)){
            return true;
          }
          return false;
        });
        if(found.length == 1){ justEnded = found[0];}else{justEnded = false;}
        // If none found set to false

        // Did the current class just start?
        var started = moment(now.startTime, "hh:mm A");
        var buffer = moment(started).add(3, 'minutes');
        if(cur.isBetween(started, buffer)) justStarted = true;

        // Get the next class
        next = ((periods.length-1 > periods.indexOf(now)) ? periods[periods.indexOf(now)+1] : false);
      }

      return {
        nowClass: now, // object of current class | false
        nextClass: next, // object of next class | false
        justStarted: justStarted, // boolean stating whether current class just started | false
        justEnded: justEnded, // object of class that just ended | false
        inSchool: inSchool // boolean stating whether the current time is during school hours
      };
    };

    // RUN
    userInfo = currentUser;
    todayInfo = userInfo.todaysClassesInfo;

    if(todayInfo !== undefined){
      schedule = getCurrentClassInfo(todayInfo.periods);
      updateDayInfo();
      setInterval(updateDayInfo, 60000);
    }else{
      $("#classInfo").remove();
      if(sessionStorage['user-status'] == "in class"){
        sessionStorage['user-status'] = "available";
        sendStatus();
      }
    }
  }
})
