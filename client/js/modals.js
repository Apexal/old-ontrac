function userbadges(){
  $(".user-badge").off("click").click(function() {
    var username = $(this).data("username");

    if($("#"+username+"-modal").length === 0){
      $.ajax({
        type: 'GET',
        url: "/api/user/"+username,
        success: function(data) {
          if(data != "Not authorized."){
            var title = data.firstName + " " + data.lastName;
            console.log(data);
            var coursenames = ['None!'];
            if(data.courses.length > 0){
              coursenames=[];
              for(var c in data.courses){
                coursenames.push(data.courses[c].title);
              }
            }

            var button = "";

            var points = "Not registered";
            if(data.registered){
              points = data.points + " points";

            }
            button = "<a class='btn btn-primary' href='/users/"+username+"'>View Full Profile</a>";

            var imgsrc = data.ipicture;
            var bio = (data.bio ? data.bio : "Not set yet!");

            var adv = data.advisement.charAt(0);
            var grade = "";
            switch(adv) {
              case "1":
                grade = "Frosh";
                break;
              case "2":
                grade = "Soph";
                break;
              case "3":
                grade = "Junior";
                break;
              case "4":
                grade = "Senior";
                break;
            }

            var rank = data.rank;
            switch(rank) {
              case 0:
                rank = "Guest";
                break;
              case 2:
                ranl = "User";
                break;
              case 3:
                rank = "Member";
                break;
              case 4:
                rank = "Operator";
                break;
              case 5:
                rank = "Moderator";
                break;
              case 6:
                rank = "Administrator";
              case 7:
                rank = "Owner";
            }


            // TODO: this thing...
            var content = $("<div class='modal fade user-modal' id='"+username+"-modal' tabindex='-1'>" +
                  "        <div class='modal-dialog'>" +
                  "            <div class='modal-content'>" +
                  "                <div class='modal-header'>" +
                  "                    <button class='close' data-dismiss='modal' type=" +
                  "                    'button'><span>&times;</span></button>" +
                  "                    <h4 class='modal-title'>User" +
                  "                    Summary</h4>" +
                  "                </div>" +
                  "                <div class='modal-body'>" +
                                    "<div class='container-fluid'>" +
                                    "    <div class='row'>" +
                                    "        <div class='col-xs-12 col-sm-3 center-xs'>" +
                                    "            <img class='modal-pic' title='Looking good!' alt='No profile picture yet!' src='"+imgsrc+"'>" +
                                    "            <br><b>"+points+"</b>" +
                                    "        </div>" +
                                    "        <div class='col-xs-12 col-sm-9'>" +
                                    "             <h3 class='no-margin center'><b>"+grade+"</b> "+data.firstName + " " +data.lastName+" of <b>"+data.advisement+"</b></h3><br>" +
                                    "             <div class='well well-sm'>" +
                                    "                 <b>Rank:</b> <span>"+rank+"</span><br>" +
                                    "                 <b>Bio: </b><span>"+bio + "</span><br>" +
                                    "                 <b>Classes: </b><span>"+coursenames.join(',  ')+"</span>" +
                                    "             </div>" +
                                    "        </div>" +
                                    "    </div>" +
                                    "</div>"+
                  "                </div>" +
                  "                <div class='modal-footer'>" +
                  "                    <button class='btn btn-default' data-dismiss='modal' type=" +
                  "                    'button'>Close</button>" + button +
                  "                </div>" +
                  "            </div>" +
                  "        </div>" +
                  "    </div>");

            $("body").append(content);
            $("#"+username+"-modal").modal();
          }
        }
      });
    }else{
      $("#"+username+"-modal").modal();
    }
  });

}


function teacherbadges(){
  $(".teacher-badge").off("click").click(function() {
    var username = $(this).data("username");

    if($("#"+username+"-modal").length === 0){
      $.ajax({
        type: 'GET',
        url: "/api/teacher/"+username,
        success: function(data) {
          if(data != "Not authorized."){
            var title = data.firstName + " " + data.lastName;
            console.log(data);
            var coursenames = ['None!'];
            if(data.courses.length > 0){
              coursenames=[];
              for(var c in data.courses){
                coursenames.push(data.courses[c].title);
              }
            }
            if(data.ratingCount > 0)
              var rating = "Going by <b>"+data.ratingCount+"</b> unique ratings, this teacher is <b>"+data.ratingStringJSON+"</b> by his students";
            else
              var rating = "None of this teacher's students has yet rated them";

            var imgsrc = data.ipicture;
            var dep = data.department;

            // TODO: this thing too...
            var content = $("<div class='modal fade teacher-modal' id='"+username+"-modal' tabindex='-1'>" +
                  "        <div class='modal-dialog'>" +
                  "            <div class='modal-content'>" +
                  "                <div class='modal-header'>" +
                  "                    <button class='close' data-dismiss='modal' type=" +
                  "                    'button'><span>&times;</span></button>" +
                  "                    <h4 class='modal-title'>Teacher" +
                  "                    Summary</h4>" +
                  "                </div>" +
                  "                <div class='modal-body'>" +
                                    "<div class='container-fluid'>" +
                                    "    <div class='row'>" +
                                    "        <div class='col-xs-12 col-sm-3 center'>" +
                                    "            <img class='modal-pic' title='Looking good!' alt='No profile picture yet!' src='"+imgsrc+"'>" +
                                    "        </div>" +
                                    "        <div class='col-xs-12 col-sm-9'>" +
                                    "             <h3 class='no-margin'>"+data.firstName + " " +data.lastName+" from <b>"+dep+"</b></h3><br>" +
                                    "             <div class='well well-sm'>" +
                                    "                 <b>Classes: </b><span>"+coursenames.join(',  ')+"</span>" +
                                    "             </div>" +
                                    "        </div>" +
                                    "    </div>" +
                                    "    <div class='row'>" +
                                    "       <h4>"+rating+"</h4>" +
                                    "    </div>" +
                                    "</div>"+
                  "                </div>" +
                  "                <div class='modal-footer'>" +
                  "                    <button class='btn btn-default' data-dismiss='modal' type=" +
                  "                    'button'>Close</button> <a class='btn btn-primary'" +
                  "                    href='/teachers/"+data.mID+"'>View Full Profile</a>" +
                  "                </div>" +
                  "            </div>" +
                  "        </div>" +
                  "    </div>");

            $("body").append(content);
            $("#"+username+"-modal").modal();
          }
        }
      });
    }else{
      $("#"+username+"-modal").modal();
    }
  });

}
