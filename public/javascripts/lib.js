$(function() {
  effects();
  if($('#send-message').data("username") !== undefined){
    sockets();
  }
});
