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
    effects();
    reminders();
    login();
    days();
    header();

    if($("#today-schedule").length > 0 && moment().isBefore(moment().hour(15))){
      $("#next-schedule").remove();
    }

    if(loggedIn){
      console.log("Logged in as "+currentUser.username);
      if(page == "home" || page==""){
        homepage();
      }
      sockets();
      clientSchedule();
      console.log(page);
      if(page == "work"){
        workindex();
        homework();
      }
    }
    updateTooltips();
    console.log("[ Done. ]");
  });

  var modules = function(){
    sockets();
  }
});
