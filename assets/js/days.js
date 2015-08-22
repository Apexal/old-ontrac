function days(){

  var date = window.location.pathname.split("/")[2];
  var scheduleDay = $("#schedule-day");
  scheduleDay.click(function() {
    var newSD = prompt("Set the schedule day: ");
    if(['A', 'B', 'C', 'D', 'E'].indexOf(newSD) > -1){
      var path = ($(this).hasClass("set") ? "setsd" : "create" );
      $.post("/days/"+date+"/"+path, {scheduleDay: newSD}, function(data) {
        if(data.error){ alert(data.error);}
        if(data.success === true){
          //alert("Successfully set schedule-day!");
          $("#schedule-day").text(newSD+"-Day");
          $("#schedule-day").addClass("set");
        }else {
          alert("Failed to set schedule-day.");
        }
      });
    }
  });

  var hwdial = $("#hw-dial");

  var percentsAndDials = function() {
    var assignmentCount = $(".assignment").length;
    var doneCount = $(".assignment.completed").length;
    var percentDone = (doneCount/assignmentCount)*100;

    hwdial.knob({
      'value': 0,
      'format': function (value) {
        return value + '%';
      }
    });

    $({value: 0}).animate({ value: percentDone }, {
      duration: 1000,
      easing: 'swing',
      progress: function () {
        hwdial.val(Math.ceil(this.value)).trigger('change');
      }
    });
  };

  percentsAndDials();

  $(".assignment").click(function() {
    var id = $(this).parent().data("id");
    $.ajax({
      type: 'POST',
      url: "/days/toggle",
      data: {
        id: id.replace("\"", "").replace("\"", "")
      },
      success: function(data) {
        percentsAndDials();
      },
      dataType: "json"
    });
    $(this).toggleClass("completed");
  });

  $(".remove-assignment").click(function() {
    var id = $(this).parent().data("id");
    $.ajax({
      type: 'POST',
      url: "/days/remove",
      data: {
        date: date,
        removeHWItemID: id.replace("\"", "").replace("\"", "")
      },
      success: function(data) {
        console.log(data);
        location.reload();
      },
      dataType: "json"
    });
  });
}
