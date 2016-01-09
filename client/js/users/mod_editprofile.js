modules.push({
  name: "editprofile",
  check: function() {
    return (PAGE == "/users/profile");
  },
  run: function() {
    var courseLinks = currentUser.customLinks;
    var htmlList = $("#custom-links");

    var requesting = false;

    function showLinks(){
      var courseID = $("#courseForLinks").val();
      $("#custom-links li").remove();
      var links = courseLinks[courseID];
      if(links){
        links.forEach(function(l) {
          htmlList.append("<li class='list-group-item'>"+l.name+"<a target='_blank' href='"+l.link+"' class='text-muted right'>"+l.link+"</a></li>");
        });
        updateRemovers();
      }
    }


    function updateRemovers(){
      $("#custom-links li").click(function() {
        var courseID = $("#courseForLinks").val();
        var link = $(this).find("a").text();
        if(confirm("Are you sure you want to remove this link?")){
          $.ajax( {url: "/users/courselinks", data: {
            removeCourseLinkID: courseID,
            removeCourseLinkHref: link
          }, method: "DELETE"})
          .done(function(data) {
            if(data.error){
              alert(data.error);
              return;
            }
            courselinks = data.newList;
            showLinks();
          });
        }
      });
    };

    // ADD COURSE LINK
    $("#courseForLinks").change(showLinks);

    $("#addCourseLink").click(function() {
      var courseID = $("#courseForLinks").val();
      var link = $("#courseLinkHref").val();
      var name = $("#courseLinkName").val();
      if(!courseID || !link || !name)
        return;

      if(requesting == false){
        requesting = true;
        $.ajax( {url: "/users/courselinks", data: {
          addCourseLinkID: courseID,
          addCourseLinkName: name,
          addCourseLinkHref: link
        }, method: "POST"})
        .done(function(data) {
          if(data.error){
            alert(data.error);
            return;
          }
          courseLinks = data.newList;
          showLinks();
          requesting = false;
        });
      }
    });
  }
});
