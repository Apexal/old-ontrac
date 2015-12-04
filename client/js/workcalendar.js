function workcalendar(){
  var c = $('#work-calendar');
  var events = [];

  function addToList(date){
    console.log(date);
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
        addToList(current.format("YYYY-MM-DD"));
      }
    }
  }

  c.fullCalendar({
    weekends: false,
    header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,basicWeek,basicDay'
		},
    dayRender: function(date, cell) {
      var dateString = date.format("MM/DD/YY");
      var sd = currentUser.scheduleObject.scheduleDays[dateString];
      if(sd !== undefined){
        cell.append('<i class="left text-muted cl-sd">'+sd+'-Day</i>');
      }
    },
    viewRender: updateEvents,
    eventRender: function(event, element) {
      element.html(event.title);
    },
    eventMouseover: function(event, jsEvent, view) {
      //$(this).html(event.description);
    },
    eventMouseout: function function_name(event, jsEvent, view) {
      //$(this).html(event.title);
    }
  });



  updateEvents(c.fullCalendar('getView'), null);


}
