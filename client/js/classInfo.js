// HOMEPAGE CLASS INFO
todayInfo = false;
userInfo = false;
schedule = false;

function updateHomepageInfo(){
  var content = "<hr>";
  var cInfo = todayInfo.currentInfo;
  if(schedule){
    $("#classInfo").html("");
    $("#cInfo-table tr").removeClass("sucess");

    //console.log(sInfo);
    if(cInfo.nowClass !== false){
      if((cInfo.nowClass.className == "Unstructured Time" || cInfo.justStarted.className == "Unstructured Time") && sessionStorage['user-status'] == "In Class")
        setStatus("Available");
      else if(cInfo.nowClass.className != "Unstructured Time" && cInfo.justStarted.className != "Unstructured Time")
        setStatus("In Class");

      if(cInfo.nowClass == "between"){
        content += "<p class='larger no-margin'><b>"+cInfo.justEnded.className+"</b> has just ended.</p>";
        if(cInfo.justStarted != false){
          content += "<h2 class='no-margin'>Get to <b>"+cInfo.justStarted.room+"</b> for <b>"+cInfo.justStarted.className+"</b></h2>";
          $("#cInfo-table td:contains('"+moment(cInfo.justStarted.startTime, "hh:mm A").format("h:mm A")+"')").parent().addClass("success");
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
        if(cInfo.nowClass !== "between")
          content += "<p class='larger'>This is the last class of your day!</p>";
      }

      $("#classInfo").html(content);
    }else{
      // out of school
      if(sessionStorage['user-status'] == "In Class"){
        setStatus("Available");
      }
    }
  }
}

function updateSidebarClassInfo(){
  var content = "";
  var cInfo = todayInfo.currentInfo;
  if(schedule){
    if(cInfo.nowClass !== false){
      $("#sidebar-class-info").show();
      if(cInfo.nowClass == "between"){
        if(cInfo.justStarted != false){
          $("#sidebar-now-class").text(cInfo.justStarted.className.split(")")[0]+")");
          $("#nowclass-room").text(cInfo.justStarted.room);
        }
      }else if(cInfo.nowClass.className == "Unstructured Time") {
        // FREE PERIOD
        $("#sidebar-now-class").text("Free Period");
      }else{
        // Regular class
        $("#sidebar-now-class").text(cInfo.nowClass.className.split(")")[0]+")");
        $("#nowclass-room").text(cInfo.nowClass.room);
      }

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
    }
  }
}

var hasClasses = false;
var registered = true;
var profileUserInfo = null;
function updateProfileSchedule(){
  var profileUsername = window.location.href.split("/")[2];
  if(!profileUserInfo){
    $.get('/api/user/'+username, function(data){
      if(data){
        console.log(data);
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
    if(profileUserInfo.todaysClassesInfo.currentInfo.inSchool == true && profileUserInfo.todaysClassesInfo.currentInfo !== false){
      var cInfo = profileUserInfo.todaysClassesInfo.currentInfo;
      if(cInfo.now !== false || cInfo.justStarted !== false){
        var n = false;
        if(cInfo.now != false)
          n = cInfo.now;
        if(cInfo.justStarted != false)
          n = cInfo.justStarted;

        if(n !== false){
          console.log(n);
          $("#profile-schedule").show();
          $("#profile-schedule p").html("<b>"+profileUserInfo.firstName+"</b> currently has <b>"+n.className+"</b> in <b>"+n.room+"</b> until <b>"+moment(n.endTime, "hh:mm A").format("h:mm A")+"</b>");
        }
      }
    }else{
      $("#profile-schedule").hide();
    }
  }
}


function clientSchedule(){
  $.get('/api/user/'+username, function(data){
    console.log(data);
    userInfo = data;
    todayInfo = userInfo.todaysClassesInfo;
    console.log(todayInfo);
    schedule = getCurrentClassInfo(todayInfo.periods);

    updateDayInfo();
    setInterval(updateDayInfo, 60000);
  });
}

function updateDayInfo(){
  schedule = getCurrentClassInfo(todayInfo.periods);
  if($("#classInfo").length)
    updateHomepageInfo();

  if($("#profile-schedule").length && registered)
    updateProfileSchedule();

  updateSidebarClassInfo();
  console.log("Updated schedule info");
}


function getCurrentClassInfo(periods){
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
      if(cur.isSame(moment(period.endTime, "hh:mm A"))){
        return true;
      }
      return false;
    });
    if(found.length == 1){ justEnded = found[0];}else{justEnded = false;}
    // If none found set to false

    // Try to find a class that just started
    var found = periods.filter(function(period) {
      if(cur.isSame(moment(period.startTime, "hh:mm A"))){
        return true;
      }
      return false;
    });
    if(found.length == 1){ justStarted = found[0];}else{justStarted = false;}
    // If none set to false

    // If a class jas just ended and another jas just started, you are in between adjacent classes
    if(justStarted !== false && justEnded !== false){
      now = "between";
    }

    // Get the next class
    if(now !== "between")
      next = ((periods.length-1 > periods.indexOf(now)) ? periods[periods.indexOf(now)+1] : false);

  }

  return {
    nowClass: now,
    nextClass: next,
    justStarted: justStarted,
    justEnded: justEnded,
    inSchool: inSchool
  };
};
