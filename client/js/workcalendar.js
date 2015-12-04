function workcalendar(){
  var c = $('#work-calendar');
  var events = [];

  function addToList(date){
    console.log(date);
    $.get('/homework/'+date+'/event', function(data) {
      if(data){
        events.push(data);
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
    dayClick: function(date, jsEvent, view) {
      window.location.href="/work/"+date.format();
    },
    viewRender: updateEvents,
    eventRender: function(event, element) {
      element.html(event.title);
    },
    eventMouseover: function(event, jsEvent, view) {
      $(this).html(event.description);
    },
    eventMouseout: function function_name(event, jsEvent, view) {
      $(this).html(event.title);
    }
  });



  updateEvents(c.fullCalendar('getView'), null);


}
