$(function() {
  console.log("Loaded JS");
  effects();
  days();
  if($('#send-message').data("username") !== undefined){
    sockets();
  }
});
