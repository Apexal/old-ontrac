var stack_bottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};

function sendNotification(ntype, title, text){
  var opts = {
      text: text,
      addclass: "stack-bottomright",
      stack: stack_bottomright,
      styling: 'bootstrap3',
      icon: false,
      type: ntype,
      buttons: {
        sticker: false
      }
  };
  new PNotify(opts);
}

function sendDesktopNotification(type, title, text){
  new PNotify({
    title: title,
    text: text,
    type: type,
    desktop: {
        desktop: true
    }
  })/*.get().click(function(e) {
      if ($('.ui-pnotify-closer, .ui-pnotify-sticker, .ui-pnotify-closer *, .ui-pnotify-sticker *').is(e.target)) return;
      alert('Hey! You clicked the desktop notification!');
  });*/
}
