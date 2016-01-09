modules.push({
  name: "mumble",
  check: function() {
    return loggedIn;
  },
  run: function() {
    var mumblers = [];

    var showMumblers = function (){
      var html = "<ul>";
      mumblers.forEach(function(user) {
        try{
        if(isNaN(user.slice(-2)) == false)
          user = "<span class='user-badge' data-username='"+user+"'><b>"+user+"</b></span>";
        }catch(err){}
        html+="<li>"+user+"</li>";
      });
      html+="</ul>";
      $("#mumble-list").html(html);

      if(mumblers.length == 0){
        $("#mumble-list").html("<span class='text-muted'>Nobody! Get on!</span>");
      }
      $("#mumble-section small").text(mumblers.length+" users");
      personbadges();
    }

    var updateMumblers = function(){
      $.get("/mumble/online", function(data) {
        mumblers = data;
        showMumblers();
      });
    }

    setInterval(updateMumblers, 1000 * 30);
    updateMumblers();
  }
});
