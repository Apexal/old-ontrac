modules.push({
  name: "github",
  check: function(){ return (loggedIn && (PAGE == "/home" || PAGE == "/"));},
  run: function() {
    function github() {
      $.get("https://api.github.com/repos/Aedificem/ontrac/git/refs/heads/master", function(data) {
        $.get("https://api.github.com/repos/Aedificem/ontrac/git/commits/"+data.object.sha, function(data) {
          $("#github").html("<a target='_blank' href='https://github.com/Aedificem/ontrac/commit/"+data.sha+"'>\""+data.message +"\"</a> by <b>"+data.author.name+"</b> "+moment(data.author.date).fromNow());
        });
      });
    }
    setTimeout(github, 120000);
    github();
  }
});
