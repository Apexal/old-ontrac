modules.push({
  name: "reminders",
  check: function(){ return loggedIn; },
  run: function() {
    var reminders = [];

    var removeReminder = function() {
      if (confirm("Remove this reminder?")) {
        var id = $(this).data("id");
        $.post("/reminders/remove", {
          id: id
        }, function(data) {
          if (data.success == true) {
            var id = data.removedID;
            for(var r=0;r<reminders.length;r++){
              if(reminders[r]._id == id)
                reminders.splice(r, 1);
            }
            displayReminders();
          }
        });
      }
    };

    $("#reminder-form").submit(function() {
      return false;
    });

    $("#add-reminder").click(function() {
      if ($("#reminder-desc").val()) {
        $.post("/reminders/add", { // I <3 POST
          desc: $("#reminder-desc").val()
        }, function(data) {
          if (data.success == true) {
            reminders.push(data.added);
            $("#reminder-desc").val("");
            displayReminders();
          }
        });
      }
    });

    var displayReminders = function(){
      if (reminders && reminders.length !== 0) {
        $("#reminder-table tr").remove();
        var htmlList = "";
        reminders.forEach(function(reminder) {
          var fromDate = moment(reminder.added_date).fromNow();

          var html = "<tr class='reminder' data-id='"+reminder._id+"'>";
          html += "<td title='"+fromDate+"'>"+reminder.desc+"</td></tr>";
          htmlList+= html;
        });
        $("#reminder-table").append(htmlList);
      } else {
        $("#reminder-table tr").remove();
        $("#reminder-table").append(
          "<tr><td class='center'>No reminders!</td></tr>"
        );
      }
      if (reminders.length === 0) {
        $(".reminder-bell").removeClass("fa-bell").addClass("fa-bell-o");
        $("#reminders-count").hide();
      } else {
        $(".reminder-bell").removeClass("fa-bell-o").addClass("fa-bell");
        $("#reminders-count").show();
        $("#reminders-count").html("&nbsp;"+reminders.length+"&nbsp;");
      }
      $(".reminder").click(removeReminder);
    }

    $.get("/reminders/all", function(data) {
      if(data.error){
        return;
      }
      reminders = data;
      displayReminders();
    });
  }
});
