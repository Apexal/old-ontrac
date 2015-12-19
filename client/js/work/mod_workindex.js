/* WORK INDEX PAGE FUNCTIONALITY
 * - Today's work due section
 * - Next day's work due section
 * - Navigation calendar
 */

modules.push({
  name: "work-index",
  check: function() {
    return (PAGE=="/work");
  },
  run: function() {
    $("#hw-calendar").fullCalendar({
      weekends: false,
      header: {
  			left: 'prev,next',
  			center: 'title',
        right: 'today'
  		},
      dayClick: function(date, jsEvent, view) {
        var dateString = date.format("YYYY-MM-DD");
        var sd = currentUser.scheduleObject.scheduleDays[dateString];
        if(sd)
          window.location.href = "/work/"+dateString;
      },
      dayRender: function( date, cell ) {
        var dateString = date.format("YYYY-MM-DD");
        if(dateString == $("#upcoming").data("closest")){
          cell.css("background-color", "#64e6fc");
        }

        var sd = currentUser.scheduleObject.scheduleDays[dateString];
        if(sd !== undefined){
          cell.append('<i class="left text-muted cl-sd">'+sd+'-Day</i>');
        }else{
          cell.css("background-color", "#ededed");
        }
      },
      defaultView: 'month'
    });

    function createWorkSection(dateString, holder){
      $.get("/homework/"+dateString, function(data){
        var date = moment(dateString, "YYYY-MM-DD");
        if(data){

          if(data.error){
            console.log(data.error);
            holder.remove();
            return;
          }

          if(data.length > 0){
            holder.find("small").text(data.length+" items");
            var courses = [];
            var total = data.length;
            var doneC = 0;
            data.forEach(function(item){
              if(item.completed)
                doneC += 1;
              if(courses.indexOf(item.course.title) == -1)
                courses.push(item.course.title);
            });

            var table = holder.find("table");

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
            holder.find("p").html("<a data-toggle='tooltip' title='"+courses.join(', ')+"' class='undecorated' href='/work/"+dateString+"'><b>"+data.length+"</b> Homework items for <b>"+date.format("dddd [the] Do")+"</b><br><span class='text-muted'><b>"+Math.round((doneC/total)*1000)/10+"%</b> completed.</span></a>");
          }else{
            holder.find("p").html("<a data-toggle='tooltip' class='undecorated' href='/work/"+dateString+"'><span class='text-muted'>You have not yet recorded any homework items due <b>"+date.format("dddd [the] Do")+"</b>.</span></a>");
          }
        }
      });
    }

    createWorkSection(moment().format("YYYY-MM-DD"), $("#due-today"));
    createWorkSection($("#upcoming").data("closest"), $("#upcoming"));
  }
});
