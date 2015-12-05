function workcalendar(){
  var c = $('#work-calendar');
  var events = [];

  function addToList(date, viewtype){
    console.log(viewtype);

    if(viewtype !== "month"){
      var sd = currentUser.scheduleObject.scheduleDays[date.format("MM/DD/YY")];
      if(sd){
        var periods = currentUser.scheduleObject.dayClasses[sd];
        periods.forEach(function(p) {
          if(p.className.indexOf(" Advisement") == -1){
            var start = moment(date.format("YYYY-MM-DD")+" "+p.startTime, "YYYY-MM-DD hh:mm A");
            var end = moment(date.format("YYYY-MM-DD")+" "+p.endTime, "YYYY-MM-DD hh:mm A");

            var color = 'rgb(204, 200, 203)';
            if(p.className !== "Lunch" && p.className !== "Unstructured Time"){
              color = "#2780E3";
            }

            events.push({
              title: p.className.split("(")[0],
              room: p.room,
              start: start,
              end: end,
              color: color,
              itemType: 'period'
            });
          }
        });
      }
    }
    var date = date.format("YYYY-MM-DD");
    $.get('/work/'+date+'/events', function(data) {
      if(data){
        if(data.constructor === Array){
          data.forEach(function(event) {
            events.push(event);
          });
        }else{
          events.push(data);
        }
        c.fullCalendar('removeEvents');
        c.fullCalendar('addEventSource', events);
      }
    });
  }

  var updateEvents = function(view, element){
    events = [];
    var start = view.start;
    var end = view.end;

    var current = start;
    while(current.add(1, 'days').diff(end, 'days') < 0){
      if(currentUser.scheduleObject.scheduleDays[current.format("MM/DD/YY")] !== undefined){
        addToList(current, view.name);
      }
    }
  }

  c.fullCalendar({
    theme: true,
    weekends: false,
    header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
    dayRender: function(date, cell) {
      var dateString = date.format("MM/DD/YY");
      var sd = currentUser.scheduleObject.scheduleDays[dateString];
      if(sd !== undefined){
        cell.append('<i class="left text-muted cl-sd">'+sd+'-Day</i>');
      }
    },
    viewRender: updateEvents,
    defaultView: 'agendaWeek',
    eventRender: function(event, element) {
      element.html(event.title);
    },
    eventMouseover: function(event, jsEvent, view) {
      console.log(event);
      if(event.itemType == "period")
        $(this).html("<b>"+event.room+"</b>");
    },
    eventMouseout: function function_name(event, jsEvent, view) {
      $(this).html(event.title);
    },
    minTime: "08:40:00",
    maxTime: "16:00:00",
    slotDuration: "00:20:00"
  });

  updateEvents(c.fullCalendar('getView'), null);
}
