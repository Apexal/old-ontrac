console.log("Loaded JS");
$(function() {
  effects();
  days();

  if($('#send-message').data("username") !== undefined){
    sockets();
  }
});
