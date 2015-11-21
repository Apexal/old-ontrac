function homepage() {
  var date = moment().format("YYYY-MM-DD");
  //alert("HOMEPAGE");
  // DUE TODAY
  if(/*moment().isBefore(moment().hour(19))*/true){
    $.get("/homework/"+date, function(data){
      var todaysDate = moment().format("YYYY-MM-DD");
      var link = "<b><a class='undecorated' href='/work/"+todaysDate+"'>";
      link += "Today";
      link += "</a></b>";
      if(data){
        console.log(data);
        if(data.error){
          console.log(data.error);
          $("#due-today").remove();
          return;
        }
        if(data.length == 0){
          $("#due-today").remove();
        }else{
          var courses = [];
          var total = data.length;
          var doneC = 0;
          data.forEach(function(item) {
            if(item.completed)
              doneC += 1;
            if(courses.indexOf(item.course.title) == -1)
              courses.push(item.course.title);
          });

          var percent = Math.round((doneC/total)*100);
          $("#due-today .progress-bar").animate({ width: percent+"%" }, 1000);

          if(doneC == 0){
            $("#due-today .content").html("You have not started <b style='color: red'>any</b> of your <b>"+total+"</b> homework items due "+link+". Get working!");
          }else if(doneC == total){
            $("#due-today .content").html("You have finished all of your <b>"+total+"</b> homework items due "+link+". Nice!");
            $("#due-today .progress").remove();
            $("#due-today .panel-heading").html("Today's Work <i class='fa fa-check right'></i>");
          }else{
            var comment = "Keep going!";
            if(percent > 50)
              comment = "More than halfway done!";
            if(percent > 80)
              comment = "Almost there!";
            $("#due-today .content").html("You have <b>"+(total - doneC)+"</b> homework assignment(s) left for "+link+". <span class='hidden-xs text-muted'><br>"+comment+"</span>");
          }
        }
      }
    });
  }else{
    $("#due-today").remove();
  }

  // CLOSEST DAY DUE

  $.get("/homework/"+$("#due-closest").data("closest"), function(data){
    var closestDate = $("#due-closest").data("closest");
    if(data){
      console.log(data);
      if(data.error){
        console.log(data.error);
        $("#due-closest").remove();
        return;
      }

      if(data.length == 0){
        $("#due-closest").remove();
        return;
      }
      var courses = [];
      var total = data.length;
      var doneC = 0;
      data.forEach(function(item) {
        if(item.completed)
          doneC += 1;
        if(courses.indexOf(item.course.title) == -1)
          courses.push(item.course.title);
      });

      var percent = Math.round((doneC/total)*100);
      $("#due-closest .progress-bar").animate({ width: percent+"%" }, 1000);

      var link = "<b><a class='undecorated' href='/work/"+closestDate+"'>";
      link += moment(closestDate, "YYYY-MM-DD").format("dddd [the] Do");
      link += "</a></b>";

      if(doneC == 0){
        $("#due-closest .content").html("You have not started <b style='color: red'>any</b> of your <b>"+total+"</b> homework items due on "+link+"! Get working!");
      }else if(doneC == total){
        $("#due-closest .content").html("You have finished all of your <b>"+total+"</b> homework items due "+link+"! Nice!");
        $("#due-closest .progress").remove();
        $("#due-closest .panel-heading").html("Upcoming Work <i class='fa fa-check right'></i>");
      }else{
        var comment = "Keep going!";
        if(percent > 50)
          comment = "More than halfway done!";
        if(percent > 80 || (total > 4 && total-doneC <= 2))
          comment = "Almost there!";
        $("#due-closest .content").html("You have <b>"+(total - doneC)+"</b> homework assignment(s) left for "+link+"! <span class='hidden-xs text-muted'><br>"+comment+"</span>");
      }

    }
  });
}
