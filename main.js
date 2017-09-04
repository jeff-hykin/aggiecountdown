'use strict';

class activity {
  constructor(name, start, end, location) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.location = location;
  }
}

var schedule = [[], [], [], [], [], [], []];

const colors = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'amber', 'orange', 'deep-orange', 'brown', 'blue-grey'];

$(() => {
  $('#addActivity').click(editActivity);
  $('#scheduleEditor').modal({
    ready: renderSchedule
  });
  $('#activityEditor').modal({
    ready: () => $('#activityName').focus()
  });
  $('#howdyImporter').modal({
    ready: () => $('#howdyImport').val('').trigger('autoresize').focus()
  });
  $('.timepicker').pickatime();
  if(localStorage.schedule) schedule = JSON.parse(localStorage.schedule);
  if(!schedule.reduce((a, b) => a + b)) $('#scheduleEditor').modal('open');
  refreshTimer();
  setInterval(refreshTimer, 1000);
});

function refreshTimer() {
  var output = timerOutput();
  document.title = (output[1]) ? output[1] : 'Aggie Countdown';
  $('#timerText').text(output[0]);
  $('#timerNumber').text(output[1]);
  $('#timerLocation').text(output[2]);
}

function timerOutput() {
  if(schedule.reduce((a, b) => a + b)) {
    var date = new Date();
    var day = date.getDay();
    var c = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    var activitiesLeft = false;
    var label = '';
    var location = '';
    var difference = 0;
    var inActivity = false;
    for(var i = 0; i < schedule[day].length; i++) {
      if(i == 0 && c < schedule[day][i].start) {
        label = schedule[day][i].name;
        location = schedule[day][i].location;
        difference = schedule[day][i].start - c;
        activitiesLeft = true;
      }
      else if(i + 1 < schedule[day].length && c < schedule[day][i + 1].start && c >= schedule[day][i].end) {
        label = schedule[day][i + 1].name;
        location = schedule[day][i + 1].location;
        difference = schedule[day][i + 1].start - c;
        activitiesLeft = true;
      }
      else if(c < schedule[day][i].end && c >= schedule[day][i].start) {
        label = schedule[day][i].name;
        location = schedule[day][i].location;
        difference = schedule[day][i].end - c;
        inActivity = true;
        activitiesLeft = true;
      }
    }
    if(!activitiesLeft) {
      var i = 1;
      while(!schedule[(day + i) % 7].length) i++;
      label = schedule[(day + i) % 7][0].name;
      location = schedule[(day + i) % 7][0].location;
      difference = (86400 * i - c) + schedule[(day + i) % 7][0].start;
    }
    var d = Math.floor(difference / 86400);
    var h = Math.floor((difference - (d * 86400)) / 3600);
    var m = Math.floor((difference - (d * 86400) - (h * 3600)) / 60);
    var s = difference - (d * 86400) - (h * 3600) - (m * 60);
    var t;
    if(!d) {
      if(!h) {
        if(!m) t = s;
        else t = m + ':' + zero(s);
      }
      else t = h + ':' + zero(m) + ':' + zero(s);
    }
    else t = d + ':' + zero(h) + ':' + zero(m) + ':' + zero(s);
    return [label + (inActivity ? ' ends in:' : ' starts in:'), t, location];
  }
  return ['no schedule', '', ''];
}

function saveSchedule() {
  for(var i = 0; i < schedule.length; i++) {
    schedule[i].sort((a, b) => a.start > b.start);
  }
  localStorage.setItem('schedule', JSON.stringify(schedule));
}

function importFromHowdy() {
  try {
    var text = $('#howdyImport').val();
    var trySchedule = [[], [], [], [], [], [], []];
    var sections = text.split('\n\n');
    sections = sections.filter(a => (a.length > 0));
    for(var i = 3; i < sections.length - 1; i++) {
      var title = sections[i].split(' - ')[1].trim();
      var timeText = sections[i].substr(sections[i].lastIndexOf('Scheduled Meeting Times')).split('\n').slice(1);
      var times = [];
      for(var j = 0; j < timeText.length; j++) {
        var timeObjects = timeText[j].split('\t');
        if(timeObjects[1].includes(' - ')) {
          var type = timeObjects[0].trim();
          if(type.indexOf('Examination') == -1) {
            var start = convertToSeconds(timeObjects[1].split(' - ')[0]);
            var end = convertToSeconds(timeObjects[1].split(' - ')[1]);
            var location = timeObjects[3];
            var day = timeObjects[2].toLowerCase();
            var days = [];
            if(day.includes('m')) days.push(1);
            if(day.includes('t')) days.push(2);
            if(day.includes('w')) days.push(3);
            if(day.includes('r')) days.push(4);
            if(day.includes('f')) days.push(5);
            days.forEach(day => trySchedule[day].push(new activity(title + ' ' + type, start, end, location)));
          }
        }
      }
    }
    if(trySchedule.reduce((a, b) => a + b)) {
      schedule = trySchedule;
      saveSchedule();
      $('#howdyImport').val('').trigger('autoresize');
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
        if(schedule[i][j].start < earliestActivityTime) earliestActivityTime = schedule[i][j].start;
        if(schedule[i][j].end > latestActivityTime) latestActivityTime = schedule[i][j].end;
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
        var randomSeed = 0;
        for(var k = 0; k < schedule[i][j].name.length; k++) {
          randomSeed += schedule[i][j].name.charCodeAt(k) / 2;
        }
        var color = colors[Math.floor(('0.' + Math.sin(randomSeed).toString().substr(10)) * colors.length)];
        var potentialHeight = (schedule[i][j].end - schedule[i][j].start) * .015;
        daysHtml += '<a href=#activityEditor id=activityButton' + i + '-' + j + ' class="activity btn waves-effect waves-light ' + color + '"data-position=bottom onclick=editActivity(' + i + ',' + j + ') style=height:' + ((potentialHeight < 36) ? 36 : potentialHeight) + 'px;top:' + (((schedule[i][j].start - earliestActivityTime * 3600) * .015) + 27) + 'px>' + schedule[i][j].name + '</a>';
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
    $('#activityName').val(schedule[day][activityNumber].name);
    $('#activityLocation').val(schedule[day][activityNumber].location);
    $('#activityStart').val(convertTo12hour(schedule[day][activityNumber].start));
    $('#activityEnd').val(convertTo12hour(schedule[day][activityNumber].end));
  }
  else {
    $('#activityEditor h4').text('Add Activity');
    $('#deleteActivity').hide();
    $('#activityDay').val((new Date).getDay());
    $('#activityName').val('');
    $('#activityLocation').val('');
    $('#activityStart').val('');
    $('#activityEnd').val('');
  }
  $('#activityDay').material_select();
  Materialize.updateTextFields();
  $('#saveActivity').unbind('click').click(() => saveActivity(day, activityNumber));
  $('#deleteActivity').unbind('click').click(() => deleteActivity(day, activityNumber));
}

function saveActivity(day, activityNumber) {
  if(day != undefined && activityNumber != undefined) schedule[day].splice(activityNumber, 1);
  schedule[$('#activityDay').val()].push(new activity(($('#activityName').val() ? $('#activityName').val() : 'untitled'), convertToSeconds($('#activityStart').val()), convertToSeconds($('#activityEnd').val()), $('#activityLocation').val()));
  $('#activityName').val('');
  $('#activityLocation').val('');
  $('#activityStart').val('');
  $('#activityEnd').val('');
  saveSchedule();
  renderSchedule();
}

function deleteActivity(day, activityNumber) {
  schedule[day].splice(activityNumber, 1);
  saveSchedule();
  renderSchedule();
}

function convertToSeconds(t) {
  if(!t) return 0;
  var a = /[aA]/.test(t);
  var p = /[pP]/.test(t);
  t = t.replace(/[^0-9:]/g, '').split(':');
  var h = t[0] * 1;
  var m = t[1] * 1;
  if(a && h == 12) h = 0;
  else if(p && h < 12) h += 12;
  if(h == 24) h = 0;
  return h * 3600 + m * 60;
}

function convertTo12hour(t) {
  var h = Math.floor(t / 3600);
  var m = Math.floor((t - h * 3600) / 60);
  if(h > 12) {
    h -= 12;
    var p = 'PM';
  }
  else if(h == 12) var p = 'PM';
  else if(h == 0) {
    h = 12;
    var p = 'AM';
  }
  else var p = 'AM';
  return zero(h) + ':' + zero(m) + p;
}

var zero = n => ('0' + n).slice(-2);
