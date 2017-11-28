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
var buildings = [];
var tempMap = '';

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
    var raw = $('#howdyImport').val();

    // New code
    array_of_classes = ParseThis(raw)
    for (each of array_of_classes)
    {
          // code will prob look like this 
          // if(each.days_of_the_week.includes('mo')) days.push(1)
          // if(each.days_of_the_week.includes('tu')) days.push(2)
          // if(each.days_of_the_week.includes('we')) days.push(3)
          // if(each.days_of_the_week.includes('th')) days.push(4)
          // if(each.days_of_the_week.includes('fr')) days.push(5)
          each.location
          each.teacher
          each.name
          each.section    
          each.start_time // example: "10:20am"
          each.end_time
    }
    
    // old code 
    var trySchedule = [[], [], [], [], [], [], []];
    raw = raw.toLowerCase().substring(0, raw.lastIndexOf('\n\n'));
    var titles = raw.match(/[a-z]{4}-[0-9]{3}-[0-9]{3}/g);
    var sections = raw.split(/[a-z]{4}-[0-9]{3}-[0-9]{3}/g);
    sections.shift();
    for(var i = 0; i < titles.length; i++) {
      var title = titles[i].trim().toUpperCase().replace(/-/g, ' ');
      title = title.substring(0, title.length - 3);
      var classesText = sections[i].trim();
      if(/[0-9]{2}:[0-9]{2} (p|a)m - [0-9]{2}:[0-9]{2} (p|a)m/.test(classesText)) {
        var classes = classesText.split('\n');
        classes.shift();
        for(var j = 0; j < classes.length / 3; j++) {
          var time = classes[j * 3 + 1];
          var start = convertToSeconds(time.split(' - ')[0]);
          var end = convertToSeconds(time.split(' - ')[1]);
          var other = classes[j * 3 + 2];
          var otherParts = other.split(' ');
          var day = otherParts[0];
          var days = [];
          if(day.includes('mo')) days.push(1);
          if(day.includes('tu')) days.push(2);
          if(day.includes('we')) days.push(3);
          if(day.includes('th')) days.push(4);
          if(day.includes('fr')) days.push(5);
          var type = otherParts[otherParts.length - 1].trim().toUpperCase();
          var location = otherParts[otherParts.length - 4].trim().toUpperCase() + ' ' + otherParts[otherParts.length - 3].trim().toUpperCase();
          var name = title + ' (' + type + ')';
          if(type != 'EXAM') days.forEach(day => trySchedule[day].push(new activity(name, start, end, location)));
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








// this code creates a function called "ParseThis()"
// just pass it a string with the text from howdy 
// and it should return an array of Course-objects
// here is what a Course object looks like
// class Course
// {
//     constructor()
//         {
//             // first line data
//             this.name    = ""
//             this.subject = ""
//             this.section = ""
//             this.course_num = null

//             // calendar info 
//             this.start_time = ""
//             this.end_time = ""
//             this.days_of_the_week = ""
            
//             // other info
//             this.teacher = ""
//             this.credits = null
//             this.location = ""
//         }
// }
var ParseThis = function(howdy_text)
    {
        // first get rid of the junk on the top and the bottom
        var getTheCoreData = /Course\t.+([\s\S]+)\n\d\d\nShow All Buildings/g;
        var match = getTheCoreData.exec(howdy_text);
        howdy_text = match[1]

        // create a function that will extract (find it, return it, then replace it) rather that EITHER finding OR replacing
        function Extract(regex_)
            {
                output_ = regex_.exec(howdy_text)
                howdy_text = howdy_text.replace(regex_,"")
                return output_
            }



        // put each of the class_strings into an array and deal with them seperately 
        output_ = ""
        class_strings = []
        while (true)
            {
                // extract the subject, course #, section # and then everything after that
                // so long as "everything after that" is before the next subject, course #, section # etc 
                output_ = Extract(/((\w\w\w\w)-(\d\d\d)-(\d\d\d)[\s\S]+?(?=(\w\w\w\w)-(\d\d\d)-(\d\d\d)))/)
                // if nothing is found, then break
                if (output_ == null) { break }
                // if something is found, put it in the array
                // show("each class\n",Indent(output_[0]))
                class_strings.push(output_[0])
            }
        // the data for the last class won't be found because there is no 'next subject, course #, section #'
        // so just add the last one manually
        class_strings.push(howdy_text)



        // create a class for the data for the different courses
        class Course
            {
                constructor()
                    {
                        // first line data
                        this.name    = ""
                        this.subject = ""
                        this.section = ""
                        this.course_num = null

                        // calendar info 
                        this.start_time = ""
                        this.end_time = ""
                        this.days_of_the_week = ""
                        
                        // other info
                        this.teacher = ""
                        this.credits = null
                        this.location = ""
                    }
                
            }

        class_objects = []
        for (each in class_strings)
            {
                // start actually parsing howdy_text
                howdy_text = class_strings[each]
                // remove leading/trailing whitespace
                howdy_text = howdy_text.replace(/^\s*/,"")
                howdy_text = howdy_text.replace(/\s*$/,"")
                
                // FIXME, not sure how web classes will work/not work with this 
                // get the name, subject, course#, and section#
                output_ = Extract(/(\w\w\w\w)-(\d\d\d)-(\d\d\d)\s+(.+)\s.+\n/)
                name       = output_[4]
                subject    = output_[1]
                course_num = parseInt(output_[2])
                section    = parseInt(output_[3])

                // get the start and end time of the class 
                output_ = Extract(/(?:(\d\d\:\d\d)\s(\w\w)\s-\s(\d\d:\d\d)\s(\w\w)|.+)\n/)
                start_time = output_[1] + output_[2].toLowerCase()
                end_time   = output_[3] + output_[4].toLowerCase()

                // days of the week
                output_ = Extract(/([\w,]+)\s+/)
                days_of_the_week = output_[1]

                // teacher 
                output_ = Extract(/(TBA|\w+\s\w+)\s+/)
                teacher = output_[1]

                // credits
                output_ = Extract(/(\d+)\s+/)
                credits = parseInt(output_[1])



                // location 
                output_ = Extract(/([\w\s\d]+)\t\w+\t\w+(?:\n.+\n|)/)
                location = output_[1]

                // get rid of remaining whitespace, if any 
                // this is prep. for seeing if the string is empty
                howdy_text = howdy_text.replace(/\s*$/,"")

                // commit all of the object data 
                // create a new object for each parsed class
                class_objects.push(new Course)
                class_objects[class_objects.length-1].name             = name
                class_objects[class_objects.length-1].subject          = subject
                class_objects[class_objects.length-1].course_num       = course_num
                class_objects[class_objects.length-1].section          = section
                class_objects[class_objects.length-1].teacher          = teacher
                class_objects[class_objects.length-1].credits          = credits
                class_objects[class_objects.length-1].start_time       = start_time 
                class_objects[class_objects.length-1].end_time         = end_time 
                class_objects[class_objects.length-1].days_of_the_week = days_of_the_week 
                class_objects[class_objects.length-1].location         = location 
                
                // while there is more in the string (a second time)
                // (normally this would be an 'if' but to be on the safe side its going to loop)
                while (howdy_text.search(/(\d\d\:\d\d)\s(\w\w)/) > -1)
                    {
                        // create a copy of the new course for the new time
                        class_objects.push(new Course)
                        class_objects[class_objects.length-1].name       = name
                        class_objects[class_objects.length-1].subject    = subject
                        class_objects[class_objects.length-1].course_num = course_num
                        class_objects[class_objects.length-1].section    = section
                        class_objects[class_objects.length-1].credits    = credits

                        // get the second (or third) start and end time of the class 
                        output_ = Extract(/(?:(\d\d\:\d\d)\s(\w\w)\s-\s(\d\d:\d\d)\s(\w\w)|.+)\n/)
                        class_objects[class_objects.length-1].start_time = output_[1] + output_[2].toLowerCase()
                        class_objects[class_objects.length-1].end_time   = output_[3] + output_[4].toLowerCase()

                        // days of the week
                        output_ = Extract(/([\w,]+)\s+/)
                        class_objects[class_objects.length-1].days_of_the_week = output_[1]

                        // teacher 
                        output_ = Extract(/(TBA|\w+\s\w+)\s+/)
                        class_objects[class_objects.length-1].teacher = output_[1]

                        // location 
                        output_ = Extract(/([\w\s\d]+)\s+\w+\s+\w+(?:\n.+\n|)/)
                        class_objects[class_objects.length-1].location = output_[1]
                    }
                
            }
        return class_objects
    } // end function 
