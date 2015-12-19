modules.push({
  name: "homepage",
  check: function() {
    return (loggedIn && (PAGE=="/" || PAGE=="/home"));
  },
  run: function() {
    function work_box(dateString){
      var date = moment(dateString, "YYYY-MM-DD");
      var isToday = date.isSame(moment().startOf('day'));
      var dateShow = (isToday ? "Today" : date.format("dddd [the] Do"));
      dateShow = "<b>"+dateShow+"</b>";

      var box = (isToday ? $("#due-today") : $("#due-closest"));

      // DUE TODAY
      if(isToday == false || moment().isBefore(moment("3:30 PM", "h:mm a"))){
        $.get("/homework/"+dateString, function(data){
          if(data){
            console.log(data);
            if(data.error){
              console.log(data.error);
              box.remove();
              return;
            }
            if(data.length == 0){
              box.find(".progress").remove();
              box.find(".panel").removeClass("panel-primary").addClass("panel-danger");
              box.find(".box-picture").remove();
              message = "You have not recorded any homework for <b>"+dateShow+"</b> yet!</a>";
              box.find(".content").parent().removeClass("col-md-9");
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
              box.find(".progress").attr("data-original-title", percent+"% done!");
              box.find(".progress-bar").animate({ width: percent+"%" }, 1000);
              updateTooltips();

              if(doneC == 0){
                message = "You have not started <b style='color: red'>any</b> of your <b>"+total+"</b> homework items due "+dateShow+". <span class='text-muted'>Get working!</span>";
              }else if(doneC == total){
                message = "You have finished all of your <b>"+total+"</b> homework items due "+dateShow+". <span class='text-muted'>Nice!</span>";
                $("#due-today .progress").remove();
                $("#due-today .panel-heading").html("Today's Work <i class='fa fa-check right'></i>");
              }else{
                var comment = "Keep going!";
                if(percent > 50)
                  comment = "More than halfway done!";
                if(percent > 80)
                  comment = "Almost there!";

                message = "You have <b>"+(total - doneC)+"</b> homework assignment(s) left for "+dateShow+". <span class='hidden-xs text-muted'><br>"+comment+"</span>";
              }
            }
            box.find(".content").html("<a class='undecorated' href='/work/"+dateString+"'>"+message+"</a>");
          }else{
            box.remove();
          }
        });
      }else{
        box.remove();
      }
    }


    work_box($("#due-closest").data("closest"));
    work_box(moment().format("YYYY-MM-DD"));
  }
});
