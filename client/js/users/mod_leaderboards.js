modules.push({
  name: "user-leaderboards",
  check: function() {
    return (PAGE == "/users");
  },
  run: function() {
    var users = [];
    var lb = $("#leaderboard");

    var header = "Points";
    var comparing = "points";

    function comparePoints(a,b) {
      if (a.points < b.points)
        return 1;
      if (a.points > b.points)
        return -1;
      return 0;
    }

    function compareLogins(a,b) {
      if (a.login_count < b.login_count)
        return 1;
      if (a.login_count > b.login_count)
        return -1;
      return 0;
    }

    function compareRanks(a,b) {
      if (a.rank < b.rank)
        return 1;
      if (a.rank > b.rank)
        return -1;
      return 0;
    }

    updateLeaderboards = function() {
      lb.html("");
      var html = ['<table class="table table-striped"><tr><th></th><th>Position</th><th>Name</th><th>'+header+'</th></tr>'];
      users.forEach(function(u) {
        var pos = (users.indexOf(u)+1);
        display = u[comparing];
        if(comparing == "rank"){
          var rank = u.rank;
          switch(rank) {
            case 1:
              rank = "Guest";
              break;
            case 2:
              rank = "User";
              break;
            case 3:
              rank = "Member";
              break;
            case 4:
              rank = "Operator";
              break;
            case 5:
              rank = "Moderator";
              break;
            case 6:
              rank = "Admin";
              break;
            case 7:
              rank = "Owner";
          }
          display = rank;
        }

        html.push('<tr class="lb-pos-'+pos+'"><td><img src="'+u.mpicture+'"></td><td>'+pos+'</td><td><span data-username="'+u.username+'" class="user-badge">'+u.firstName+' '+u.lastName+'</span></td><td>'+display+'</td></tr>');
      });
      html.push('</table>');

      lb.html(html.join(''));
      personbadges();
    }

    $("#lb-points").click(function() {
      header = "Points";
      comparing = "points";
      users.sort(comparePoints);
      updateLeaderboards();
    });

    $("#lb-logins").click(function() {
      header = "Login Count";
      comparing = "login_count";
      users.sort(compareLogins);
      updateLeaderboards();
    });

    $("#lb-rank").click(function() {
      header = "User Rank";
      comparing = "rank";
      users.sort(compareRanks);
      updateLeaderboards();
    });

    $.get('/users/api/list', {registeredOnly: "1"}, function(data) {
      users = data;
      users.sort(comparePoints);
      updateLeaderboards();
    });
  }
});
