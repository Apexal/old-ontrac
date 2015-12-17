if(navigator.userAgent.indexOf('Edge') > -1){
  // in Edge the navigator.appVersion does not say trident
  alert("Unfortunately, OnTrac does not yet work on Microsoft Edge. I am looking into this. Please use Chrome or Firefox for now.");
}

(function(){
  PNotify.desktop.permission();
  page = window.location.pathname;
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
      if(page == "/" || page == "/home"){
        init_ads();
        homepage();
      }

      init_sockets();
      init_clientSchedule();

      if(page.indexOf("work") > -1){
        workindex();
        homework();
      }

      if(page=="/users/profile"){
        editProfile();
      }
    }else{
      init_login();
    }
    updateTooltips();
    console.log("[ Done. ]");
  });
})();
