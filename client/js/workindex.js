function workindex(){
  var date = moment().format("YYYY-MM-DD");
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
        data.hwItems.forEach(function(item) {
          if(courses.indexOf(item.course.title) == -1)
            courses.push(item.course.title);
        });
        $("#due-today p").html("<a class='undecorated' href='/work/"+date+"'><b>"+data.hwItems.length+"</b> Homework items for <b>"+courses.join(', ')+"</b></a>");
      }
    }
  });

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
        data.hwItems.forEach(function(item) {
          if(courses.indexOf(item.course.title) == -1)
            courses.push(item.course.title);
        });
        $("#upcoming p").html("<a class='undecorated' href='/work/"+$("#upcoming").data("closest")+"'><b>"+data.hwItems.length+"</b> Homework items for <b>"+courses.join(', ')+"</b></a>");
      }
    }
  });
}
