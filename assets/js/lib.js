var stack_bottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};

function sendNotification(ntype, title, text){
  var opts = {
      text: text,
      addclass: "stack-bottomright",
      stack: stack_bottomright,
      styling: 'bootstrap3',
      icon: false,
      type: ntype
  };
  new PNotify(opts);
}

$(function() {
  console.log("Loaded JS");
  effects();
  days();
  if($('#send-message').data("username") !== undefined){
    sockets();
  }
});
