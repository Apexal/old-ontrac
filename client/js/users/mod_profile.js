modules.push({
  name: "user-profile",
  check: function() {
    return (PAGE.indexOf("/users/") > -1);
  },
  run: function() {
    var profile_username = PAGE.split("/users/")[1];
    $("#stars").position({my: "left bottom", at: "left bottom", of: "#profile-pic"});
    $("#rank").position({my: "right bottom", at: "right bottom", of: "#profile-pic"});
  }
});
