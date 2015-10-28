(function() {
  var app = angular.module('users', []);
  app.controller('UserController', ['$http', function($http) {
    var store = this;
    store.user = null;
    var url = window.location.pathname.split("/")[2];
    //alert(url);
    $http.get('/users/api/'+url).then(function(response) {
      if(response.data.error){
        alert("FAILED");
      }else{
        store.user = response.data;
        console.log("ANGLED: ");
        console.log(store.user);
      }
    });
  }]);
})();
