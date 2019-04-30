'use strict';

var apple = /Mac|iPad|iPhone|iPod/.test(navigator.platform);

class activity {
  constructor(name, start, end, location) {
    this.name     = name;
    this.start    = start;
    this.end      = end;
    this.location = location;
  }
}

var schedule  = [[], [], [], [], [], [], []];
var buildings = [];

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
  if(localStorage.schedule)
    schedule = JSON.parse(localStorage.schedule);
  if(!(schedule[0].length + schedule[1].length + schedule[2].length + schedule[3].length + schedule[4].length + schedule[5].length + schedule[6].length))
    $('#howdyImporter').modal('open');
  $('#howdyImporter').html($('#howdyImporter').html().replace(/{modifer}/g, apple ? '⌘' : 'control'));
  refreshTimer();
  setInterval(refreshTimer, 1000);
  refreshMap();
  setInterval(refreshMap, 1800000);
});

function refreshTimer() {
  var output     = timerOutput();
  document.title = (output[1]) ? output[1] : 'TamuClock';
  $('#timerText').text(output[0]);
  $('#timerNumber').text(output[1]);
  $('#timerLocation').text(output[2]);
}

function refreshMap() {
  var output = timerOutput();
  if(output[2].length) {
    var address = translateAbbr(output[2]);
    if(navigator.geolocation.getCurrentPosition(location => {
         var prevAddress = location.coords.latitude + ',' + location.coords.longitude;
         $('iframe').show().prop('src', prevAddress.length ? 'https://www.google.com/maps/embed/v1/directions?origin=' + prevAddress + '&destination=' + address + '&mode=walking&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8' : 'https://www.google.com/maps/embed/v1/place?q=' + address + '&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8');
       })) {}
    else {
      var prevAddress = output[3].length ? translateAbbr(output[3]) : '';
      $('iframe').show().prop('src', prevAddress.length ? 'https://www.google.com/maps/embed/v1/directions?origin=' + prevAddress + '&destination=' + address + '&mode=walking&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8' : 'https://www.google.com/maps/embed/v1/place?q=' + address + '&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8');
    }
  }
  else
    $('iframe').hide();
}

function translateAbbr(location) {
  var tryAbbr   = location.split(' ')[0];
  var foundAddr = false;
  for(var i = 0; i < buildings.length; i++) {
    if(buildings[i]['Abbr'] && buildings[i]['Abbr'].toUpperCase() == tryAbbr.toUpperCase() && buildings[i].Address)
      return buildings[i]['Address'] + ', ' + buildings[i]['City'];
  }
  if(!foundAddr) {
    for(var i = 0; i < buildings.length; i++) {
      if(buildings[i]['Bldg Name'] && buildings[i]['Bldg Name'].toUpperCase().includes(tryAbbr.toUpperCase()) && buildings[i].Address)
        return buildings[i]['Address'] + ', ' + buildings[i]['City'];
    }
  }
  return location;
}

function timerOutput() {
  if(schedule[0].length + schedule[1].length + schedule[2].length + schedule[3].length + schedule[4].length + schedule[5].length + schedule[6].length) {
    var date           = new Date();
    var day            = date.getDay();
    var c              = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    var activitiesLeft = false;
    var label          = '';
    var location       = '';
    var prevLocation   = '';
    var difference     = 0;
    var inActivity     = false;
    for(var i = 0; i < schedule[day].length; i++) {
      if(i == 0 && c < schedule[day][i].start) {
        label          = schedule[day][i].name;
        location       = schedule[day][i].location;
        difference     = schedule[day][i].start - c;
        activitiesLeft = true;
      }
      else if(i + 1 < schedule[day].length && c < schedule[day][i + 1].start && c >= schedule[day][i].end) {
        label          = schedule[day][i + 1].name;
        prevLocation   = schedule[day][i].location;
        location       = schedule[day][i + 1].location;
        difference     = schedule[day][i + 1].start - c;
        activitiesLeft = true;
      }
      else if(c < schedule[day][i].end && c >= schedule[day][i].start) {
        label          = schedule[day][i].name;
        location       = schedule[day][i].location;
        difference     = schedule[day][i].end - c;
        inActivity     = true;
        activitiesLeft = true;
      }
    }
    if(!activitiesLeft) {
      var i = 1;
      while(!schedule[(day + i) % 7].length)
        i++;
      label      = schedule[(day + i) % 7][0].name;
      location   = schedule[(day + i) % 7][0].location;
      difference = (86400 * i - c) + schedule[(day + i) % 7][0].start;
    }
    var d = Math.floor(difference / 86400);
    var h = Math.floor((difference - (d * 86400)) / 3600);
    var m = Math.floor((difference - (d * 86400) - (h * 3600)) / 60);
    var s = difference - (d * 86400) - (h * 3600) - (m * 60);
    var t;
    if(!d) {
      if(!h) {
        if(!m)
          t = s;
        else
          t = m + ':' + zero(s);
      }
      else
        t = h + ':' + zero(m) + ':' + zero(s);
    }
    else
      t = d + ':' + zero(h) + ':' + zero(m) + ':' + zero(s);
    return [label + (inActivity ? ' ends in:' : ' starts in:'), t, location, prevLocation];
  }
  return ['no schedule', '', '', ''];
}

function saveSchedule() {
  for(var i = 0; i < schedule.length; i++) {
    schedule[i].sort((a, b) => a.start > b.start);
  }
  localStorage.setItem('schedule', JSON.stringify(schedule));
  renderSchedule();
}

function importFromHowdy() {
  var raw = $('#howdyImport').val().toUpperCase();
  if(raw.length) {
    try {
      var trySchedule = [[], [], [], [], [], [], []];
      var titles      = raw.match(/[A-Z]{4}-[0-9]{3}-[0-9]{3}/gi);
      var sections    = raw.split(/[A-Z]{4}-[0-9]{3}-[0-9]{3}/gi);
      sections.shift();
      for(var i = 0; i < sections.length; i++)
        if(sections[i].includes('SHOW ALL BUILDINGS ON MAP'))
          sections[i] = sections[i].substr(0, sections[i].search(/[0-9]{1,}\s*SHOW ALL BUILDINGS ON MAP/)).trim();
      for(var i = 0; i < titles.length; i++) {
        var title       = titles[i].trim().replace(/-/gi, ' ');
        title           = title.substring(0, title.length - 3).trim();
        var classesText = sections[i].trim();
        if(/[0-9]{2}:[0-9]{2} (P|A)M - [0-9]{2}:[0-9]{2} (P|A)M/i.test(classesText)) {
          var classes = classesText.split('\n');
          classes.shift();
          for(var j = 0; j < classes.length / 3; j++) {
            var time       = classes[j * 3 + 1].replace(/\s{1,}/gi, ' ');
            var start      = convertToSeconds(time.split(' - ')[0]);
            var end        = convertToSeconds(time.split(' - ')[1]);
            var other      = classes[j * 3 + 2].replace(/\s{1,}/gi, ' ');
            var otherParts = other.split(' ');
            var day        = otherParts[0];
            var days       = [];
            if(day.includes('MO'))
              days.push(1);
            if(day.includes('TU'))
              days.push(2);
            if(day.includes('WE'))
              days.push(3);
            if(day.includes('TH'))
              days.push(4);
            if(day.includes('FR'))
              days.push(5);
            var type     = otherParts[otherParts.length - 1].trim();
            var location = otherParts[otherParts.length - 4].trim() + ' ' + otherParts[otherParts.length - 3].trim();
            var name     = title + ' (' + type + ')';
            if(type != 'EXAM')
              days.forEach(day => trySchedule[day].push(new activity(name, start, end, location)));
          }
        }
      }
      if(trySchedule[0].length + trySchedule[1].length + trySchedule[2].length + trySchedule[3].length + trySchedule[4].length + trySchedule[5].length + trySchedule[6].length) {
        $('#howdyError').text('');
        schedule = trySchedule;
        saveSchedule();
        $('#howdyImport').val('');
        $('#howdyImporter').modal('close');
      }
      else {
        //console.log('empty schedule');
        $('#howdyError').text('Invalid schedule.');
        $('#howdyError')
        [0].scrollIntoView();
      }
    }
    catch(e) {
      //console.log(e);
      $('#howdyError').text('Invalid schedule.');
      $('#howdyError')
      [0].scrollIntoView();
    }
  }
  else
    $('#howdyError').text('');
}

function renderSchedule() {
  $('#schedule > tbody').empty();
  if(localStorage.schedule) {
    var earliestActivityTime = 86400;
    var latestActivityTime   = 0;
    for(var i = 0; i < schedule.length; i++) {
      for(var j = 0; j < schedule[i].length; j++) {
        if(schedule[i][j].start < earliestActivityTime)
          earliestActivityTime = schedule[i][j].start;
        if(schedule[i][j].end > latestActivityTime)
          latestActivityTime = schedule[i][j].end;
      }
    }
    earliestActivityTime = Math.floor(earliestActivityTime / 3600);
    latestActivityTime   = Math.ceil(latestActivityTime / 3600);
    var timeLabelsHtml   = '<td>';
    for(var i = earliestActivityTime; i <= latestActivityTime; i++)
      timeLabelsHtml += '<p class=timeLabel>' + convertTo12hour(i * 3600) + '</p>';
    timeLabelsHtml += '</td>';
    var daysHtml = '';
    for(var i = 0; i < 7; i++) {
      daysHtml += '<td>';
      for(var j = 0; j <= (latestActivityTime - earliestActivityTime) * 4; j++)
        daysHtml += '<span class="separator thin" style=top:' + (j * 13.5 + 26.5) + 'px></span>';
      for(var j = 0; j <= (latestActivityTime - earliestActivityTime); j++)
        daysHtml += '<span class="separator thick" style=top:' + (j * 54 + 26) + 'px></span>';
      for(var j = 0; j < schedule[i].length; j++) {
        var randomSeed = 0;
        for(var k = 0; k < schedule[i][j].name.length; k++)
          randomSeed += schedule[i][j].name.charCodeAt(k) / 2;
        var color           = colors[Math.floor(('0.' + Math.sin(randomSeed).toString().substr(10)) * colors.length)];
        var potentialHeight = (schedule[i][j].end - schedule[i][j].start) * .015;
        daysHtml += '<a href=#activityEditor id=activityButton' + i + '-' + j + ' class="activity btn waves-effect waves-light ' + color + '"data-position=bottom onclick=editActivity(' + i + ',' + j + ') style=height:' + ((potentialHeight < 36) ? 36 : potentialHeight) + 'px;top:' + (((schedule[i][j].start - earliestActivityTime * 3600) * .015) + 27) + 'px>' + schedule[i][j].name + '</a>';
      }
      var timeSeconds = (new Date).getSeconds() + (new Date).getMinutes() * 60 + (new Date).getHours() * 3600;
      if(i == (new Date).getDay() && (earliestActivityTime * 3600) <= timeSeconds && timeSeconds <= (latestActivityTime * 3600))
        daysHtml += '<span class="separator currentTime" style=top:' + ((timeSeconds - earliestActivityTime * 3600) * .015 + 26) + 'px></span>';
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
  if(day != undefined && activityNumber != undefined)
    schedule[day].splice(activityNumber, 1);
  $('#activityDay').val().forEach(day => schedule[day].push(new activity(($('#activityName').val() ? $('#activityName').val() : 'untitled'), convertToSeconds($('#activityStart').val()), convertToSeconds($('#activityEnd').val()), $('#activityLocation').val())));
  $('#activityName').val('');
  $('#activityLocation').val('');
  $('#activityStart').val('');
  $('#activityEnd').val('');
  saveSchedule();
}

function deleteActivity(day, activityNumber) {
  schedule[day].splice(activityNumber, 1);
  saveSchedule();
}

function convertToSeconds(t) {
  if(!t)
    return 0;
  var a = /[aA]/.test(t);
  var p = /[pP]/.test(t);
  t     = t.replace(/[^0-9:]/g, '').split(':');
  var h = t[0] * 1;
  var m = t[1] * 1;
  if(a && h == 12)
    h = 0;
  else if(p && h < 12)
    h += 12;
  if(h == 24)
    h = 0;
  return h * 3600 + m * 60;
}

function convertTo12hour(t) {
  var h = Math.floor(t / 3600);
  var m = Math.floor((t - h * 3600) / 60);
  if(h > 12) {
    h -= 12;
    var p = 'PM';
  }
  else if(h == 12)
    var p = 'PM';
  else if(h == 0) {
    h     = 12;
    var p = 'AM';
  }
  else
    var p = 'AM';
  return h + ':' + zero(m) + ' ' + p;
}

var zero = n => ('0' + n).slice(-2);
