function workindex() {
  // DUE TODAY
  $.get("/homework/"+moment().format("YYYY-MM-DD"), function(data){
    var date = moment().format("YYYY-MM-DD");
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

        $("#due-today p").html("<a data-toggle='tooltip' title='"+courses.join(', ')+"' class='undecorated' href='/work/today'><b>"+data.length+"</b> Homework items <b>"+Math.round((doneC/total)*1000)/10+"%</b> completed.</a>");
      }else{
        $("#due-today").remove();
      }
    }
  });

  // CLOSEST DAY DUE
  $.get("/homework/"+$("#upcoming").data("closest"), function(data){
    var dateString = $("#upcoming").data("closest");
    var date = moment(dateString, "YYYY-MM-DD");
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
        $("#upcoming p").html("<a data-toggle='tooltip' title='"+courses.join(', ')+"' class='undecorated' href='/work/"+dateString+"'><b>"+data.length+"</b> Homework items <b>"+Math.round((doneC/total)*1000)/10+"%</b> completed.</a>");
      }else{
        $("#upcoming p").html("<a data-toggle='tooltip' class='undecorated' href='/work/"+dateString+"'><span class='text-muted'>You have not yet recorded any homework items due <b>"+date.format("dddd [the] Do")+"</b>.</span></a>");
      }
    }
  });
}
