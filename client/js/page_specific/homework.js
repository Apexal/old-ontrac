function homework(){
  var moodle_window = null;
  var work = {
    homework: []
  };

  var showForm = (sessionStorage['showHWForm'] ? Number(sessionStorage['showHWForm']) : 0);

  if(showForm == 0){
    $("#homework-form").addClass("hidden-xs");
    $(".worklist .remove-assignment").addClass("hidden-xs");
  }

  $("#toggle-hw-form").click(function() {
    if(showForm == 0){
      showForm = 1;
      $("#homework-form").removeClass("hidden-xs");
      $(".worklist .remove-assignment").removeClass("hidden-xs");
    }else{
      showForm = 0;
      $("#homework-form").addClass("hidden-xs");
      $(".worklist .remove-assignment").addClass("hidden-xs");
    }
    sessionStorage['showHWForm'] = showForm;
  });

  var durationSizes = {
    20: 6,
    40: 11,
    60: 17
  }

  $("#day-schedule td").each(function() {
    $(this).css("width", durationSizes[$(this).data("length")]+"%");
  });

  $("#day-schedule td").click(function() {
    var mID = $(this).data("mid");
    var text = $(this).text().trim();
    $("#newHWItemCourseID option").attr("selected", false);
    $("#newHWItemCourseID option").each(function() {
      var item = $(this).text().trim();
      var that = $(this);
      if(item.indexOf(text) > -1 || item == text || text.indexOf(item) > -1){
        that.attr("selected", true);
      }
    });
  });

  $("#day-schedule td i.fa-link").click(function() {
    var mID = $(this).data("mid");
    // POPUP
    if(mID){
      if(moodle_window == null || moodle_window.closed){
        var width = screen.width/2;
        var height = screen.height/2;
        moodle_window=window.open('http://moodle.regis.org/course/view.php?id='+mID,'_blank','scrollbars=yes, height='+height+',width='+width);
      }else{
        moodle_window.location = "http://moodle.regis.org/course/view.php?id="+mID;
      }
      if (window.focus) {moodle_window.focus()}
    }
  });

  // ------------- GET HOMEWORK ON PAGE LOAD --------------
  var date = window.location.pathname.split("/")[2];
  console.log(window.location.pathname.split("/") + date);
  if(moment(date, "YYYY-MM-DD", true).isValid()){
    $.get("/homework/"+date, function(data){
      if(data){
        if(data.error){
          console.log(data.error);
          sendNotification("info", "", data.error);
          return;
        }
        work.homework = data;
        displayWork();
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
    desc = desc.trim();
    if(!cID || !desc || link.length == undefined){
      console.log("Missing some values")
      return false;
    }

    var div = document.createElement('div');
    div.appendChild(document.createTextNode(desc));
    desc = div.innerHTML;

    $.ajax({
      url: "/homework/"+date,
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
        url: "/homework/"+date,
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
      $.post("/homework/"+date,
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
    var doneC = 0;
    var total = work.homework.length;
    work.homework.forEach(function(item){
      if(item.completed)
        doneC++;
      //console.log(item.course.title);
      if(hwTitles.indexOf(item.course.title) == -1)
        hwTitles.push(item.course.title);

      if(!hw[item.course.title])
        hw[item.course.title] = [];

      hw[item.course.title].push(item);
    });

    hwTitles.forEach(function(t){
      var items = hw[t];
      var html = "<div class='col-xs-12 col-md-6 hw-item text-center'> \
        <b class='title course-badge' data-mid='"+items[0].course.mID+"'>"+t+"</b> \
        <ol>";
      items.forEach(function(i){
        var link = "";
        if(i.link !== "")
          link = "<a href='"+i.link+"' target='_blank' class='fa fa-link'></a>";

        var visibility = "hidden-xs";
        if(showForm == 1)
          visibility = "visible-xs";

        html+= "<li data-id='"+i._id+"'><span class='assignment "+(i.completed == true ? " completed" : "");
        html += "'>"+i.desc+" </span>"+link;

        // PC REMOVE ASSIGNMENT
        html += "<i class='fa fa-close remove-assignment hidden-xs hidden-sm hidden-md hidden-lg pc'></i>";

        // MOBILE REMOVE ASSIGNMENT
        html += "<i class='fa fa-close remove-assignment "+visibility+" hidden-sm hidden-md hidden-lg mobile'></i></li>";
      });
      html += "</ol></div>";

      hwHTML += html;
    });

    if(hwTitles.length == 0){
      hwHTML = "<div class='col-xs-12 text-center'>";
      hwHTML   +=   "<span class='larger text-muted'>No homework!</span>";
      hwHTML+= "</div>";
    }

    var percent = Math.round((doneC/total)*100);
    $("#homework-progress")
      .animate({ width: percent+"%" }, 500)
    $("#homework-content .progress").attr("data-original-title", "You are "+percent+"% done with homework!");
    tab.html(hwHTML);
    $(".hw-badge").attr("title", percent + "% done!").attr("data-toggle", "tooltip").attr("data-placement", "right");
    $(".hw-badge").text(total);
    coursebadges();
    setRemoveClickHandler();
    setToggleHandler();
    updateTooltips();
    updateHoverButtons();
  }


  // -------------------------------------------------------

  function updateHoverButtons(){
    var items = $(".worklist li");
    items.each(function() {
      var assignment = $(this).find('.assignment');
      var removeIcon = $(this).find('i.remove-assignment.pc');
      $(this).hover(function() {
        //console.log("ON");
        removeIcon.removeClass('hidden-sm hidden-md hidden-lg');
      }, function function_name(argument) {
        //console.log("OFF");
        removeIcon.addClass('hidden-sm hidden-md hidden-lg');
      });
    });
  }



  $("#hw-popup").click(function() {
  	return false;
  });
}
