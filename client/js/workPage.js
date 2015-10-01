function workPage(){
  var work = {
    homework: []
  };

  // ------------- GET HOMEWORK ON PAGE LOAD --------------
  var date = window.location.pathname.split("/")[2];
  console.log(window.location.pathname.split("/") + date);
  if(moment(date, "YYYY-MM-DD", true).isValid()){
    $.get("/work/"+date+"/homework", function(data){
      console.log(data);
      if(data){
        if(data.error){
          console.log(data.error);
          sendNotification("info", "", data.error);
          return;
        }

        if(data.success){
          work.homework = data.hwItems;
          displayWork();
        }
      }
    });
  }else{
    console.log("Not specific work  page.");
  }
  // -----------------------------------------------------



  // -------------------- ADD HOMEWORK -------------------
  $("#set-hw-link").click(function(){
    $("#newHWItemLink").val(prompt("Link for Assignment", $("#newHWItemLink").val()));
  });

  function addHWItem(cID, desc, link){
    if(!cID || !desc || link.length == undefined){
      console.log("Missing some values")
      return false;
    }
    $.ajax({
      url: "/work/"+date+"/homework",
      method: 'PUT',
      data: {
        newHWItemCourseID: cID,
        newHWItemDesc: desc,
        newHWItemLink: link
      },
      success: function(data){
        if(data.error){
          sendNotification("info", "", data.error);
          return false;
        }else if(data.success && data.added){
          work.homework.push(data.added);
          displayWork();
        }
      }
    });
  }

  $("#homework-form").submit(function(e) {
    e.preventDefault();
    addHWItem($("#newHWItemCourseID").val(), $("#newHWItemDesc").val(), $("#newHWItemLink").val());
    $("#newHWItemLink").val("");
    $("#newHWItemDesc").val("");
    return false;
  });
  // -------------------------------------------------------





  // -------------------- DISPLAY WORK ---------------------
  var tab = $("#homework-content .worklist");
  function displayWork(){
    tab.html("");
    var hwHTML = "";
    console.log("displayWork()");
    console.log(work.homework);
    // HOMEWORK
    var hw = {};
    var hwTitles = [];
    work.homework.forEach(function(item){
      //console.log(item.course.title);
      if(hwTitles.indexOf(item.course.title) == -1)
        hwTitles.push(item.course.title);

      if(!hw[item.course.title])
        hw[item.course.title] = [];

      hw[item.course.title].push(item);
    });

    console.log(hw);

    hwTitles.forEach(function(t){
      var items = hw[t];
      var html = "<div class='col-xs-12 col-md-6 hw-item text-center'> \
        <b class='title course-badge' data-mid='"+items[0].course.mID+"'>"+t+"</b> \
        <ol>";
      items.forEach(function(i){
        html+= "<li data-id='"+i._id+"'><span class='assignment "+(i.completed == true ? " completed" : "");
        html += "'>"+i.desc+" </span><i class='fa fa-close remove-assignment'></i><span>&nbsp;  &nbsp;  &nbsp;</span></li>";
      });
      html += "</ol></div>";

      hwHTML += html;
    });

    tab.html(hwHTML);
    coursebadges();
  }


  // -------------------------------------------------------
}
