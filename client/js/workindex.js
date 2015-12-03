function workindex() {
  if(!$("#upcoming").length)
    return;

  var date = moment().format("YYYY-MM-DD");
  // DUE TODAY
  $.get("/homework/"+date, function(data){
    if(data){
      console.log(data);
      if(data.error){
        console.log(data.error);
        $("#due-today").remove();
        return;
      }

      if(data.length > 0){
        $("#due-today small").text(data.length+" items");
        var courses = [];
        var total = data.length;
        var doneC = 0;
        data.forEach(function(item) {
          if(item.completed)
            doneC += 1;
          if(courses.indexOf(item.course.title) == -1)
            courses.push(item.course.title);
        });

        var table = $("#due-today table");

        var hw = {};
        var hwTitles = [];
        var doneC = 0;
        var total = data.length;
        data.forEach(function(item){
          if(item.completed)
            doneC++;
          //console.log(item.course.title);
          if(hwTitles.indexOf(item.course.title) == -1)
            hwTitles.push(item.course.title);

          if(!hw[item.course.title])
            hw[item.course.title] = [];

          hw[item.course.title].push(item);
        });

        table.html("");
        var html = "";
        hwTitles.forEach(function(cTitle) {
          html+="<tr><td>"+cTitle+"</td><td>"+hw[cTitle].length+" items</td></tr>";
        });
        table.html(html);

        $("#due-today p").html("<a data-toggle='tooltip' title='"+courses.join(', ')+"' class='undecorated' href='/work/"+date+"'><b>"+data.length+"</b> Homework items <b>"+Math.round((doneC/total)*1000)/10+"%</b> completed.</a>");
      }else{
        $("#due-today").remove();
      }
    }
  });

  // CLOSEST DAY DUE
  $.get("/homework/"+$("#upcoming").data("closest"), function(data){
    if(data){
      console.log(data);
      if(data.error){
        console.log(data.error);
        $("#closest").remove();
        return;
      }

      if(data.length > 0){
        $("#upcoming small").text(data.length+" items");
        var courses = [];
        var total = data.length;
        var doneC = 0;
        data.forEach(function(item){
          if(item.completed)
            doneC += 1;
          if(courses.indexOf(item.course.title) == -1)
            courses.push(item.course.title);
        });

        var table = $("#upcoming table");

        var hw = {};
        var hwTitles = [];
        var doneC = 0;
        var total = data.length;
        data.forEach(function(item){
          if(item.completed)
            doneC++;
          //console.log(item.course.title);
          if(hwTitles.indexOf(item.course.title) == -1)
            hwTitles.push(item.course.title);

          if(!hw[item.course.title])
            hw[item.course.title] = [];

          hw[item.course.title].push(item);
        });

        table.html("");
        var html = "";
        hwTitles.forEach(function(cTitle) {
          html+="<tr><td>"+cTitle+"</td><td>"+hw[cTitle].length+" items</td></tr>";
        });
        table.html(html);
        $("#upcoming p").html("<a data-toggle='tooltip' title='"+courses.join(', ')+"' class='undecorated' href='/work/"+$("#upcoming").data("closest")+"'><b>"+data.length+"</b> Homework items <b>"+Math.round((doneC/total)*1000)/10+"%</b> completed.</a>");
      }else{
        $("#closest").remove();
      }
    }
  });

  $('#work-calendar').fullCalendar({
    weekends: false,
    header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,basicWeek,basicDay'
		},
    dayClick: function(date, jsEvent, view) {
      window.location.href="/work/"+date.format();
    }
  });
}
