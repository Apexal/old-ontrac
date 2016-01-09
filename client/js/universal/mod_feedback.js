modules.push({
  name: "feedback",
  check: function() {
    return loggedIn;
  },
  run: function() {
    $("#feedback-form").submit(function(e) {
      e.preventDefault();
      return false;
    });
    $("#send-feedback").click(function() {
      var type = $("#feedback-type").val();
      var text = $("#feedback-text").val();
      if (type && text) {
        $.post("/api/feedback/send", {
          feedbackType: type,
          text: text
        }, function(data) {
          if (data.success === true) {
            $("#feedback-text").val("");
            $("#feedback-modal").modal("hide");
          }
        });
      }
    });
  }
});
