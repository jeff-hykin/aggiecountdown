'use strict';

var schedule = [[], [], [], [], [], [], []];

$(document).ready(function() {
  $('#addClass').click(function() {
    editActivity();
  })
  $('#scheduleEditor').modal({
    ready: function() {
      renderSchedule();
    }
  });
  $('#activityEditor').modal({
    ready: function() {
      $('#activityName').focus();
    }
  });
  $('#howdyImporter').modal({
    ready: function() {
      $('#howdyImport').focus();
    }
  });
  if(localStorage.schedule) schedule = JSON.parse(localStorage.schedule);
  if(schedule[0].length + schedule[1].length + schedule[2].length + schedule[3].length + schedule[4].length + schedule[5].length + schedule[6].length == 0) $('#scheduleEditor').modal('open');
  refreshTimer();
  setInterval(function() {
    refreshTimer();
  }, 1000);
});

function refreshTimer() {
  var output = timerOutput();
  document.title = (output[1]) ? output[1] : 'Aggie Countdown';
  $('#timerText').text(output[0]);
  $('#timerNumber').text(output[1]);
}

function timerOutput() {
  var date = new Date();
  var day = date.getDay();
  var c = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  var activities = false;
  var label = '';
  var d = 0;
  var inActivity = false;
  var daySchedule = schedule[day];
  for(var i = 0; i < daySchedule.length; i++) {
    if(i == 0 && c < daySchedule[i][1]) {
      label = daySchedule[i][0];
      d = daySchedule[i][1] - c;
      activities = true;
    }
    else if(i + 1 < daySchedule.length && c < daySchedule[i + 1][1] && c >= daySchedule[i][2]) {
      label = daySchedule[i + 1][0];
      d = daySchedule[i + 1][1] - c;
      activities = true;
    }
    else if(c < daySchedule[i][2] && c >= daySchedule[i][1]) {
      label = daySchedule[i][0];
      d = daySchedule[i][2] - c;
      inActivity = true;
      activities = true;
    }
  }
  if(activities) {
    var h = Math.floor(d / 3600);
    var m = Math.floor((d - h * 3600) / 60);
    var s = d - h * 3600 - m * 60;
    if(h + m == 0) var timer = s;
    else if(h == 0) var timer = m + ':' + zero(s);
    else var timer = h + ':' + zero(m) + ':' + zero(s);
    return [label + (inActivity ? ' ends in:' : ' starts in:'), timer];
  }
  return ['no more activities today', ''];
}

function saveSchedule() {
  for(var i = 0; i < schedule.length; i++) {
    schedule[i].sort(function(a, b) {
      return a[1] > b[1];
    });
  }
  localStorage.setItem('schedule', JSON.stringify(schedule));
}

function importFromHowdy() {
  try {
    var text = $('#howdyImport').val();
    var trySchedule = [[], [], [], [], [], [], []];
    var sections = text.split('\n\n');
    sections = sections.filter(function(a) {
      return (a.length > 0);
    })
    for(var i = 3; i < sections.length - 1; i++) {
      var name = sections[i].split(' - ')[1].trim();
      var timeText = sections[i].substr(sections[i].lastIndexOf('Scheduled Meeting Times')).split('\n').slice(1);
      var times = [];
      for(var j = 0; j < timeText.length; j++) {
        var timeObjects = timeText[j].split('\t');
        if(timeObjects[1].includes(' - ')) {
          var type = timeObjects[0].trim();
          var start = convertToSeconds(timeObjects[1].split(' - ')[0]);
          var end = convertToSeconds(timeObjects[1].split(' - ')[1]);
          var day = timeObjects[2].toLowerCase();
          var days = [];
          if(day.includes('m')) days.push(1);
          if(day.includes('t')) days.push(2);
          if(day.includes('w')) days.push(3);
          if(day.includes('r')) days.push(4);
          if(day.includes('f')) days.push(5);
          if(JSON.stringify(times[times.length - 1]) != JSON.stringify([start, end, days, type])) times.push([start, end, days, type]);
        }
      }
      for(var j = 0; j < times.length; j++) {
        if(times[j] != undefined) {
          for(var k = 0; k < times[j][2].length; k++) {
            trySchedule[times[j][2][k]].push([name + ' ' + times[j][3], times[j][0], times[j][1]]);
          }
        }
      }
    }
    if(trySchedule[0].length + trySchedule[1].length + trySchedule[2].length + trySchedule[3].length + trySchedule[4].length + trySchedule[5].length + trySchedule[6].length) {
      schedule = trySchedule;
      saveSchedule();
      $('#howdyImport').val('');
      $('#howdyImport').trigger('autoresize');
      $('#howdyImporter').modal('close');
      renderSchedule();
    }
  }
  catch(e) {}
}

function renderSchedule() {
  $('#schedule > tbody').empty();
  if(localStorage.schedule) {
    var earliestActivityTime = 86400;
    var latestActivityTime = 0;
    for(var i = 0; i < schedule.length; i++) {
      for(var j = 0; j < schedule[i].length; j++) {
        if(schedule[i][j][1] < earliestActivityTime) earliestActivityTime = schedule[i][j][1];
        if(schedule[i][j][2] > latestActivityTime) latestActivityTime = schedule[i][j][2];
      }
    }
    earliestActivityTime = Math.floor(earliestActivityTime / 3600);
    latestActivityTime = Math.ceil(latestActivityTime / 3600);
    var timeLabelsHtml = '<td>';
    for(var i = earliestActivityTime; i <= latestActivityTime; i++) {
      timeLabelsHtml += '<p class=timeLabel>' + convertTo12hour(i * 3600) + '</p>';
    }
    timeLabelsHtml += '</td>';
    var daysHtml = '';
    for(var i = 0; i < schedule.length; i++) {
      daysHtml += '<td>';
      for(var j = 0; j < schedule[i].length; j++) {
        var potentialHeight = (schedule[i][j][2] - schedule[i][j][1]) * .015;
        daysHtml += '<a href=#activityEditor id=activityButton' + i + '-' + j + ' class="activity btn waves-effect waves-light teal" onclick=editActivity(' + i + ',' + j + ') style=height:' + ((potentialHeight < 36) ? 36 : potentialHeight) + 'px;top:' + (((schedule[i][j][1] - earliestActivityTime * 3600) * .015) + 27) + 'px>' + schedule[i][j][0];
      }
      daysHtml += '</td>';
    }
    $('#schedule > tbody').append('<tr>' + timeLabelsHtml + daysHtml + '</tr>');
  }
}

function editActivity(day, activityNumber) {
  if(day != undefined && activityNumber != undefined) {
    $('#activityEditor h4').text('Edit Activity');
    $('#deleteActivity').show();
    $('#activityDay').val(day);
    $('#activityName').val(schedule[day][activityNumber][0]);
    $('#activityStart').val(convertTo12hour(schedule[day][activityNumber][1]));
    $('#activityEnd').val(convertTo12hour(schedule[day][activityNumber][2]));
  }
  else {
    $('#activityEditor h4').text('Add Activity');
    $('#deleteActivity').hide();
    $('#activityDay').val(0);
    $('#activityName').val('');
    $('#activityStart').val('');
    $('#activityEnd').val('');
  }
  $('#activityDay').material_select();
  Materialize.updateTextFields();
  $('#saveActivity').unbind('click');
  $('#saveActivity').click(function() {
    saveActivity(day, activityNumber);
  });
  $('#deleteActivity').unbind('click');
  $('#deleteActivity').click(function() {
    deleteClass(day, activityNumber);
  });
}

function saveActivity(day, activityNumber) {
  if(day != undefined && activityNumber != undefined) schedule[day].splice(activityNumber, 1);
  schedule[$('#activityDay').val()].push([($('#activityName').val() ? $('#activityName').val() : 'untitled'), convertToSeconds($('#activityStart').val()), convertToSeconds($('#activityEnd').val())]);
  $('#activityName').val(0);
  $('#activityName').val('');
  $('#activityStart').val('');
  $('#activityEnd').val('');
  saveSchedule();
  renderSchedule();
}

function deleteClass(day, activityNumber) {
  schedule[day].splice(activityNumber, 1);
  saveSchedule();
  renderSchedule();
}

function convertToSeconds(t) {
  var a = (t.toLowerCase()).includes('a');
  var p = (t.toLowerCase()).includes('p');
  t = t.replace(/[^0-9:]/g, '');
  t = t.split(':');
  if(t.length == 2 || t.length == 1) {
    var h = ((t[0] * 1) + '').substring(0, 2) * 1;
    var m = (t.length == 2) ? ((t[1] * 1) + '').substring(0, 2) * 1 : 0;
  }
  else return 0;
  if(h > 23 || m > 59) return 0;
  if(a && h == 12) h = 0;
  else if(p && h < 12) h += 12;
  if(h == 24) h = 0;
  return h * 3600 + m * 60;
}

function convertTo12hour(t) {
  var h = Math.floor(t / 3600);
  var m = Math.floor((t - h * 3600) / 60);
  if(h > 12) {
    h = h - 12;
    var p = 'pm';
  }
  else if(h == 12) var p = 'pm';
  else if(h == 0) {
    h = 12;
    var p = 'am';
  }
  else var p = 'am';
  return h + ':' + zero(m) + ' ' + p;
}

function zero(n) {
  return ('0' + n).slice(-2);
}
