$(function() {
    $( "#chat-box.resizable" ).resizable({
      maxHeight: 550,
      maxWidth: 650,
      minHeight: 250,
      minWidth: 400,
      handles: 'n'
    });
    $("#chat-box.resizable").height("300px");
});
