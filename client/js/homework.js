function homework(){
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

    var div = document.createElement('div');
    div.appendChild(document.createTextNode(desc));
    desc = div.innerHTML;

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




  // -------------------- REMOVE HOMEWORK ------------------
  function setRemoveClickHandler(){
    $(".worklist .remove-assignment").off().click(function(){
      if(!confirm("Are you sure you want to remove this assignment?")) return;
      var id = $(this).parent().data("id");
      var index = work.homework.indexOf(work.homework.filter(function(i){
        if(i._id == id) return true;
        return false;
      })[0]);
      $.ajax({
        url: "/work/"+date+"/homework",
        method: 'DELETE',
        data: {
          deleteHWItemID: id
        },
        success: function(data){
          if(data.error){
            sendNotification("info", "", data.error);
            return false;
          }else{
            work.homework.splice(index, 1);
            displayWork();
          }
        }
      });
    });
  }
  // -------------------------------------------------------

  // -------------------- TOGGLE HOMEWORK ------------------

  function setToggleHandler(){
    $(".worklist .assignment").off().click(function(){
      var id = $(this).parent().data("id");
      var index = work.homework.indexOf(work.homework.filter(function(i){
        if(i._id == id) return true;
        return false;
      })[0]);
      var status = work.homework[index].completed;
      $.post("/work/"+date+"/homework",
        {
          setCompHWItemID: id,
          setCompHWItemStatus: !status
        },
        function(data){
          if(data.error){
            sendNotification("info", "", data.error);
            return false;
          }else{
            work.homework[index].completed = !status;
            displayWork();
          }
        }
      );
    });
  }


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
      var html = "<div class='col-xs-12 col-md-5 hw-item text-center'> \
        <b class='title course-badge' data-mid='"+items[0].course.mID+"'>"+t+"</b> \
        <ol>";
      items.forEach(function(i){
        var link = "";
        if(i.link !== "")
          link = "<a href='"+i.link+"' target='_blank' class='fa fa-link'></a>";

        html+= "<li data-id='"+i._id+"'><span class='assignment "+(i.completed == true ? " completed" : "");
        html += "'>"+i.desc+" </span>"+link+"<i class='fa fa-close remove-assignment'></i><span>&nbsp;  &nbsp;  &nbsp;</span></li>";
      });
      html += "</ol></div>";

      hwHTML += html;
    });

    tab.html(hwHTML);
    coursebadges();
    setRemoveClickHandler();
    setToggleHandler();
  }


  // -------------------------------------------------------
}
