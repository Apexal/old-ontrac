function days(){
  var hwdial = $("#hw-dial");

  var percentsAndDials = function() {
    var assignmentCount = $(".assignment").length;
    var doneCount = $(".assignment.completed").length;
    var percentDone = (doneCount/assignmentCount)*100;

    hwdial.knob({
      'value': 0,
      'format': function (value) {
        return value + '%';
      }
    });

    $({value: 0}).animate({ value: percentDone }, {
      duration: 1000,
      easing: 'swing',
      progress: function () {
        hwdial.val(Math.ceil(this.value)).trigger('change');
      }
    });
  };

  percentsAndDials();
}
