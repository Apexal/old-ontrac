modules.push({
  name: "_modals",
  check: function() {
    return loggedIn;
  },
  run: function() {
    personbadges = function(){
      var createPersonBadge = function(bType, username) {
        var content = $("<div class='modal "+bType+"-modal' id='"+username+"-modal' tabindex='-1'>" +
              "        <div class='modal-dialog'>" +
              "            <div class='modal-content'>" +
              "                <div class='modal-header'>" +
              "                    <button class='close' data-dismiss='modal' type=" +
              "                    'button'><span>&times;</span></button>" +
              "                    <h4 class='modal-title'>Loading...</h4>" +
              "                </div>" +
              "                <div class='modal-body'>" +
              "                   <div class='container-fluid'>" +
              "                     <div class='row'>" +
              "                       <div class='col-xs-12 col-sm-3 center-xs modal-img'>" +
              "                         <img class='modal-pic' title='Looking good!' " +
              "                           alt='No profile picture yet!' src='/images/placeholder.png'>" +
              "                         <div class='modal-underimg'></div>" +
              "                       </div>" +
              "                       <div class='col-xs-12 col-sm-9'>" +
              "                         <h3 class='no-margin center modal-info'>Loading...</h3>" +
              "                         <div class='modal-inside'>Loading...</div>" +
              "                       </div>" +
              "                     </div>" +
              "                   </div>"+
              "                </div>" +
              "                <div class='modal-footer'></div>" +
              "            </div>" +
              "        </div>" +
              "    </div>");

          $("body").append(content);
          var mod = $("#"+username+"-modal");
          mod.modal();

          var url = "/users/api/"+username;
          if(bType == "staff")
            url = "/api/teacher/"+username;

          $.ajax({
            type: 'GET',
            url: url,
            success: function(user) {
              if(user !== "Not authorized." && user.error == undefined){
                var heading = (bType == "user" ? user.rankName : "Teacher") + " Summary";
                mod.find(".modal-title").html(heading);

                var grade = user.gradeName;
                if(grade !== undefined){
                  switch(grade) {
                    case "Freshman":
                      grade = "Frosh";
                      break;
                    case "Sophomore":
                      grade = "Soph";
                      break;
                  }
                }

                var dep = user.department;
                if(bType == "user")
                  dep = user.advisement;
                if(bType == "user")
                  dep = "<a class='undecorated' href='/advisements/"+dep+"'>"+dep+"</a>";
                var info = (bType=="user" ? "<b>"+grade+"</b> " : "") + user.fullName +" of <b>"+dep+"</b>";
                mod.find(".modal-info").html(info)
                if(bType == "staff")
                  mod.find(".modal-inside").append("<br><br>");

                // ------- IMG DIV -----------------------------------
                mod.find(".modal-pic").attr("src", user.ipicture);
                if(bType == "user"){
                  var underimg = "<b class='left text-danger'>Not registered</b>";
                  if(user.registered){
                    underimg = "<b class='left'>"+user.points+" points</b>";
                  }
                  mod.find(".modal-underimg").html(underimg);
                }else{
                  mod.find(".modal-underimg").remove();
                }
                // ----------------------------------------------------

                if(bType == "user"){
                  bio = "<p class='text-center text-muted'>"+user.firstName+" has not set a bio!</span>";
                  if(user.bio){
                    bio = "<p class='text-center'>\""+user.bio+"\"</p>";
                  }
                  mod.find(".modal-inside").html(bio);
                }
                if(bType == "user"){
                  if(user.registered){
                    //console.log(data);
                    if(user.todaysClassesInfo){
                      user.sInfo = user.todaysClassesInfo.currentInfo;
                      if(user.sInfo.inSchool){
                        var now = (user.sInfo.nowClass !== false && user.sInfo.nowClass !== "between" ? user.sInfo.nowClass : user.sInfo.justStarted);
                        if(now !== false){
                          var location = $("<div class='well well-sm'>As of <b>" +moment().format("h:mm A")+
                            "</b>, "+user.firstName+" is in <b>"+now.className+"</b> in <b>"+
                            now.room + "</b> until <b>"+moment(now.endTime, "hh:mm A").format("h:mm A")+"</b></div>");
                            mod.find(".modal-inside").append(location);

                        }
                      }
                    }
                  }else{
                    mod.find(".modal-inside").text(user.fullName+" has not yet used OnTrac. Why don't you invite him!");
                  }
                }else if(bType == "staff"){
                  var coursenames = ['None!'];
                  if(user.courses.length > 0){
                    coursenames=[];
                    for(var c in user.courses){
                      coursenames.push(user.courses[c].title);
                    }
                  }
                  var well = "<div class='well well-sm'><b>Classes: </b><span>";
                  well += coursenames.join(',  ')+"</span></div>";

                  mod.find('.modal-inside').html(well);
                }
                // -----------------------------------------------------
                var button = "";
                if(bType == "user"){
                  button += "<a class='btn btn-primary' href='/users/"+username+"'>View Profile</a>";
                  button += "<button class='btn btn-default' data-dismiss='modal' type='button'>Close</button>";
                }else{
                  button += "<a class='btn btn-default' href='mailto:"+user.email+"'>Email</a>";
                  button += "<a class='btn btn-info' target='_blank' href='http://moodle.regis.org/user/profile.php?id="+user.mID+"'>Moodle Profile</a>";
                  button += "<a class='btn btn-primary' href='http://intranet.regis.org/infocenter/default.cfm?StaffCode="+user.code+"' target='blank'>Schedule</a>";
                }
                mod.find('.modal-footer').append($(button));
              }else{
                mod.modal("hide");
              }
            }
          });
      }

      $(".user-badge").off("click").click(function() {
        if($(this).data("username") == undefined) return;
        var username = $(this).data("username");

        if($("#"+username+"-modal").length === 0)
          createPersonBadge("user", username);
        else
          $("#"+username+"-modal").modal();
      });

      $(".teacher-badge").off("click").click(function() {
        if($(this).data("username") == undefined) return;
        var username = $(this).data("username");

        if($("#"+username+"-modal").length === 0)
          createPersonBadge("staff", username);
        else
          $("#"+username+"-modal").modal();
      });
    }

    // TODO: Use the new system with this
    coursebadges = function (){
      $(".course-badge").off("click").click(function() {
        var mID = $(this).data("mid");

        if($("#course-"+mID+"-modal").length === 0){
          $.ajax({
            type: 'GET',
            url: "/api/course/"+mID,
            success: function(data) {
              if(data != "Not authorized."){
                var title = data.title;
                var teachertitle = "";
                var teacherpic = "";
                if(data.teacher){
                  teacherpic = "<div class='col-xs-12 col-sm-3 center'>" +
                        "<a target='_blank' href='http://moodle.regis.org/user/profile.php?id="+data.teacher.mID+
                        "'><img class='modal-pic' title='Looking good!' alt='No profile picture yet!' src='"+
                        data.teacher.ipicture+"'></a></div>";

                  teachertitle = "with <b>Teacher "+data.teacher.firstName+" "+data.teacher.lastName+"</b>";
                }


                var content = $("<div class='modal fade teacher-modal' id='course-"+mID+"-modal' tabindex='-1'>" +
                      "        <div class='modal-dialog'>" +
                      "            <div class='modal-content'>" +
                      "                <div class='modal-header'>" +
                      "                    <button class='close' data-dismiss='modal' type=" +
                      "                    'button'><span>&times;</span></button>" +
                      "                    <h4 class='modal-title'>Course " +
                      "                    Summary</h4>" +
                      "                </div>" +
                      "                <div class='modal-body'>" +
                                        "<div class='container-fluid'>" +
                                        "    <div class='row'>" + teacherpic +
                                        "        <div class='col-xs-12 col-sm-9'>" +
                                        "             <h3 class='no-margin'> Course "+title+" "+teachertitle+"</h3><br>" +
                                        "             <div class='well well-sm'>" +
                                        "                 <p>This course has <b>"+data.students.length+"</b> enrolled students." +
                                        "             </div>" +
                                        "        </div>" +
                                        "    </div>" +
                                        "</div>"+
                      "                </div>" +
                      "                <div class='modal-footer'>" +
                      "                     <a class='btn btn-primary' target='_blank' " +
                      "                    href='http://moodle.regis.org/course/view.php?id="+mID+"'>Moodle Page</a>" +
                      "                </div>" +
                      "            </div>" +
                      "        </div>" +
                      "    </div>");

                $("body").append(content);
                if(!data.err)
                  $("#course-"+mID+"-modal").modal();
              }
            }
          });
        }else{
          $("#course-"+mID+"-modal").modal();
        }
      });
    }

    personbadges();
    coursebadges();
  }
});
