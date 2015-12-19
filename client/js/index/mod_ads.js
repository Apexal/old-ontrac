modules.push({
  name: "advertisements",
  check: function(){ return (loggedIn && (PAGE == "/home" || PAGE == "/"));},
  run: function() {
    $('#advertisements').slidesjs({
      width: 250,
      height: 110,
      start: Math.floor((Math.random() * $("#advertisements img").length) + 1),
      play: {
        auto: true,
        interval: 7000,
        pauseOnHover: true
      }
    });
  }
});
