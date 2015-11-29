$(function() {
  PNotify.desktop.permission();
  page = window.location.href.split("/")[3];
  loggedIn = false;
  originalTitle = $("title").text();
  currentUser = undefined;

  // Get currently loggedIn user
  $.get("/api/loggedIn", function(data) {
    if(!data.error){
      currentUser = data;
      username = currentUser.username;
      loggedIn = true;
    }else{
      sessionStorage.unread = 0;
      sessionStorage.advunread = 0;
    }
    console.log("[ Loading OnTrac JS... ]");

    updateTitle();
    init_effects();
    init_reminders();

    // If it's a school day and it's before 3 PM, remove the next schedule
    if($("#today-schedule").length > 0 && moment().isBefore(moment().hour(15))){
      $("#next-schedule").remove();
    }

    // Self-explanatory
    if(loggedIn){
      console.log("Logged in as "+currentUser.username);
      if(page == "home" || page==""){
        homepage();
      }
      init_sockets();
      init_clientSchedule();
      console.log(page);
      if(page == "work"){
        workindex();
        homework();
      }
    }else{
      init_login();
    }
    updateTooltips();
    console.log("[ Done. ]");
  });

  var modules = function(){
    sockets();
  }
});
