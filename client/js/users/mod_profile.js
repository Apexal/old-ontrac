modules.push({
  name: "user-profile",
  check: function() {
    return (PAGE.indexOf("/users/") > -1);
  },
  run: function() {
    $("#stars").position({my: "left bottom", at: "left bottom", of: "#profile-pic"});
    $("#rank").position({my: "right bottom", at: "right bottom", of: "#profile-pic"});
  }
});
