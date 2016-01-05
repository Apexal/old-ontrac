modules.push({
  name: "helpPages",
  check: function() {
    return ($("#help-modal").length && loggedIn);
  },
  run: function() {
    var helpPath = $("#help-modal").data("path");
    if(!helpPath) return;

    var dontShow = (localStorage['dontShowHelpPages'] ? localStorage['dontShowHelpPages'].split(",") : []);

    dontShow.forEach(function(p) {
      if(helpPath == p)
        $("#help-modal input[type='checkbox']").prop('checked', true);
    });

    if(dontShow.indexOf(helpPath) == -1)
      $("#help-modal").modal();

    $("#help-modal input[type='checkbox']").change(function() {
      if($(this).is(":checked") && dontShow.indexOf(helpPath) == -1) {
        dontShow.push(helpPath);
        localStorage['dontShowHelpPages'] = dontShow.join(",");
      }else{
        dontShow.splice(dontShow.indexOf(helpPath), 1);
        localStorage['dontShowHelpPages'] = dontShow.join(",");  
      }
    });
  }
});
