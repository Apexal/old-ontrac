function homepage() {
  var date = moment().format("YYYY-MM-DD");
  //alert("HOMEPAGE");
  // DUE TODAY
  if(moment().isBefore(moment().hour(15))){
    $.get("/work/"+date+"/all", function(data){
      if(data){
        console.log(data);
        if(data.error){
          console.log(data.error);

          $("#due-today").remove();
          return;
        }

        if(data.success){
          if(data.hwItems.length == 0)
            $("#due-today").remove();
          var courses = [];
          var total = data.hwItems.length;
          var doneC = 0;
          data.hwItems.forEach(function(item) {
            if(item.completed)
              doneC += 1;
            if(courses.indexOf(item.course.title) == -1)
              courses.push(item.course.title);
          });

          var percent = Math.round((doneC/total)*100);
          $("#due-today .progress-bar").animate({ width: percent+"%" }, 1000);

          if(doneC == 0){
            $("#due-today .content").html("You have not started <b style='color: red'>any</b> of your <b>"+total+"</b> homework items due <b>Today!</b> Get working!");
          }else if(doneC == total){
            $("#due-today .content").html("You have finished all of your <b>"+total+"</b> homework items due <b>Today!</b> Nice!");
            $("#due-today .progress").remove();
            $("#due-today .media-heading").html("Today's Work <i class='fa fa-check'></i>");
          }else{
            var comment = "Keep going!";
            if(percent > 50)
              comment = "More than halfway done!";
            if(percent > 80)
              comment = "Almost there!";
            $("#due-today .content").html("You have <b>"+(total - doneC)+"</b> homework assignment(s) left for <b>Today!</b> <span class='hidden-xs text-muted'><br>"+comment+"</span>");
          }
        }
      }
    });
  }else{
    $("due-today").remove();
  }

  // CLOSEST DAY DUE
  if(moment().isAfter(moment().hour(15))){
    $.get("/work/"+$("#due-closest").data("closest")+"/all", function(data){
      if(data){
        console.log(data);
        if(data.error){
          console.log(data.error);
          $("#due-closest").remove();
          return;
        }

        if(data.success){
          if(data.hwItems.length == 0)
            $("#due-closest").remove();
          var courses = [];
          var total = data.hwItems.length;
          var doneC = 0;
          data.hwItems.forEach(function(item) {
            if(item.completed)
              doneC += 1;
            if(courses.indexOf(item.course.title) == -1)
              courses.push(item.course.title);
          });

          var percent = Math.round((doneC/total)*100);
          $("#due-closest .progress-bar").animate({ width: percent+"%" }, 1000);

          if(doneC == 0){
            $("#due-closest .content").html("You have not started <b style='color: red'>any</b> of your <b>"+total+"</b> homework items due on <b>"+moment($("#due-closest").data("closest"), "YYYY-MM-DD").format("dddd [the] Do")+"</b>! Get working!");
          }else if(doneC == total){
            $("#due-closest .content").html("You have finished all of your <b>"+total+"</b> homework items due  <b>"+moment($("#due-closest").data("closest"), "YYYY-MM-DD").format("dddd [the] Do")+"</b>! Nice!");
            $("#due-closest .progress").remove();
            $("#due-closest .media-heading").html("Upcoming Work <i class='fa fa-check'></i>");
          }else{
            var comment = "Keep going!";
            if(percent > 50)
              comment = "More than halfway done!";
            if(percent > 80)
              comment = "Almost there!";
            $("#due-closest .content").html("You have <b>"+(total - doneC)+"</b> homework assignment(s) left for <b>"+moment($("#due-closest").data("closest"), "YYYY-MM-DD").format("dddd [the] Do")+"</b>! <span class='hidden-xs text-muted'><br>"+comment+"</span>");
          }
        }
      }
    });
  }else{
    $("due-closest").remove();
  }
}
