function workindex() {
  var date = moment().format("YYYY-MM-DD");
  // DUE TODAY
  $.get("/work/"+date+"/all", function(data){
    if(data){
      console.log(data);
      if(data.error){
        console.log(data.error);
        $("#due-today").hide();
        return;
      }

      if(data.success){
        $("#due-today small").text(data.hwItems.length+" items");
        var courses = [];
        var total = data.hwItems.length;
        var doneC = 0;
        data.hwItems.forEach(function(item) {
          if(item.completed)
            doneC += 1;
          if(courses.indexOf(item.course.title) == -1)
            courses.push(item.course.title);
        });
        $("#due-today p").html("<a data-toggle='tooltip' title='"+courses.join(', ')+"' class='undecorated' href='/work/"+date+"'><b>"+data.hwItems.length+"</b> Homework items <b>"+Math.round((doneC/total)*1000)/10+"%</b> completed.</a>");

      }
    }
  });

  // CLOSEST DAY DUE
  $.get("/work/"+$("#upcoming").data("closest")+"/all", function(data){
    if(data){
      console.log(data);
      if(data.error){
        console.log(data.error);
        $("#closest").hide();
        return;
      }

      if(data.success){
        $("#upcoming small").text(data.hwItems.length+" items");
        var courses = [];
        var total = data.hwItems.length;
        var doneC = 0;
        data.hwItems.forEach(function(item) {
          if(item.completed)
            doneC += 1;
          if(courses.indexOf(item.course.title) == -1)
            courses.push(item.course.title);
        });
        $("#upcoming p").html("<a data-toggle='tooltip' title='"+courses.join(', ')+"' class='undecorated' href='/work/"+$("#upcoming").data("closest")+"'><b>"+data.hwItems.length+"</b> Homework items <b>"+Math.round((doneC/total)*1000)/10+"%</b> completed.</a>");
      }
    }
  });
}
