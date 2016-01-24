modules.push({
  name: "feedback",
  check: function() {
    return loggedIn;
  },
  run: function() {
    $(".animate-number").each(function() {
      $(this).animateNumber({number: $(this).data("number")}, 2000);
    });
  }
});
