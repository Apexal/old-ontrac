var removeReminder = function() {
    console.log("click");
    if (confirm("Remove this reminder?")) {
        var id = $(this).data("id");
        $.post("/reminders/remove", {
            id: id
        }, function(data) {
            if (data.success == true) {
              reminders();
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
              reminders();
              $("#reminder-desc").val("");
            }
        });
    }
});

function reminders() {
  var reminders = [];
  if (username) {
      $.get("/reminders/all", function(data) {
          if (data.reminders && data.reminders.length !==
              0) {
              reminders = data.reminders;
              $("#reminder-table tr").remove();
              for (var reminder in reminders) {
                  $("#reminder-table").append(
                      "<tr class='reminder' data-id='" +
                      reminders[reminder]._id +
                      "'><td title='Added " + moment(
                          reminders[reminder].added_date
                      ).fromNow() + "'>" + reminders[
                          reminder].desc +
                      "</td></tr>");
              }
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
      });
  }
}
