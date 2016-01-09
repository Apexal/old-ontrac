modules.push({
  name: "work-calendar",
  check: function() {
    return (loggedIn && (PAGE=="/" || PAGE=="/home"));
  },
  run: function(){
    var c = $('#work-calendar');

    c.fullCalendar({
      weekends: false,
      header: {
  			left: 'prev,next today',
  			center: 'title',
  			right: 'month,basicWeek,basicDay'
  		},
      dayRender: function(date, cell) {
        var dateString = date.format("YYYY-MM-DD");
        var sd = currentUser.scheduleObject.scheduleDays[dateString];
        if(sd !== undefined){
          cell.append('<i class="left text-muted cl-sd">'+sd+'-Day</i>');
        }else{
          cell.css("background-color", "#ededed");
        }
      },
      viewRender: function(view, element){
        if(view.name != "month"){
          c.fullCalendar('option', 'aspectRatio', 3.5);
        }else{
          c.fullCalendar('option', 'aspectRatio', 1.2);
        }
      },
      defaultView: 'basicWeek',
      eventRender: function(event, element) {
        element.html(event.title);
      },
      eventMouseover: function(event, jsEvent, view) {
        if(event.itemType == "period")
          $(this).html("<b>"+event.room+"</b>");
      },
      eventMouseout: function function_name(event, jsEvent, view) {
        $(this).html(event.title);
      },
      minTime: "08:40:00",
      maxTime: "14:50:00",
      slotDuration: "00:20:00",
      eventSources: ["/homework/events", "/study/events"]
    });
  }
})
