modules.push({
  name: "user-leaderboards",
  check: function() {
    return (PAGE == "/users");
  },
  run: function() {
    var users = [];
    var lb = $("#leaderboard");

    var rankNames = {
      1: "Guest",
      2: "User",
      3: "Member",
      4: "Operator",
      5: "Moderator",
      6: "Admin",
      7: "Owner"
    }

    var header = "Points";
    var comparing = "points";

    function compare(a, b){
      if (a[comparing] < b[comparing])
        return 1;
      if (a[comparing] > b[comparing])
        return -1;
      return 0;
    }

    updateLeaderboards = function() {
      lb.html("");
      var html = ['<table class="table table-striped"><tr><th></th><th>Position</th><th>Name</th><th>'+header+'</th></tr>'];
      users.forEach(function(u) {
        var pos = (users.indexOf(u)+1);
        display = u[comparing];
        if(comparing == "rank")
          display = rankNames[u.rank];

        html.push('<tr class="lb-pos-'+pos+'"><td><img src="'+u.mpicture+'"></td><td>'+pos+'</td><td><span data-username="'+u.username+'" class="user-badge">'+u.firstName+' '+u.lastName+'</span></td><td>'+display+'</td></tr>');
      });
      html.push('</table>');

      lb.html(html.join(''));
      personbadges();
    }

    $("#leaderboard-sorting button").click(function() {
      comparing = $(this).data("compare");
      header = $(this).text();
      users.sort(compare);
      updateLeaderboards();
    });

    $.get('/users/api/list', {registeredOnly: "1"}, function(data) {
      users = data;
      users.sort(compare);
      updateLeaderboards();
    });
  }
});
