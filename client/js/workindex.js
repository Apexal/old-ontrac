function workindex(){
  var date = window.location.pathname.split("/")[2];
  $.get("/work/"+date+"/all", function(data){
    console.log(data);
    if(data){
      if(data.error){
        console.log(data.error);
        sendNotification("info", "", data.error);
        return;
      }

      if(data.success){
        console.log(data);
      }
    }
  });
}
