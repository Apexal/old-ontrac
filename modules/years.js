var moment = require('moment');

var years = [
  {
    years: "2014-2015",
    trimesters: ["2014-09-08", "2014-12-02", "2015-02-24"],
    end: "2015-06-09"
  },
  {
    years: "2015-2016",
    trimesters: ["2015-09-09", "2015-12-01", "2016-02-22"],
    end: "2016-09-08"
  }
];

module.exports = {
  // Get the current school year and trimester
  getCurrent: function(){
    var toReturn = {};

    // Loop through every year object above
    years.forEach(function(y){
      var ys = y.years;
      var tris = y.trimesters;

      // Check if the school year is this school year
      if(moment().isBetween(tris[0], y.end)){
        toReturn.years = ys;
        toReturn.full = y;
        // Figure out trimester number
        if(moment().isBetween(tris[0], tris[1])){
          toReturn.trimester = 1;
        }else if(moment().isBetween(tris[1], tris[2])){
          toReturn.trimester = 2;
        }else {
          toReturn.trimester = 3;
        }
      }
    });
    return toReturn;
  },
  years: years
}
