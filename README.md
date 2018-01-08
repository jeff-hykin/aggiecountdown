# Overview
[TamuClock](http://tamuclock.com) is a web application that displays a countdown timer reflecting the time remaining between items in a user-defined schedule.  Although it can be used for just about any purpose, it is specifically designed to help Texas A&M students keep track of their classes.  TamuClock runs entirely in the browser (except for the embedded Google map) and stores all user data using HTML5 Web Storage (window.localStorage).

# Getting Started

When you first open TamuClock, you will be prompted to import your schedule from Howdy.  If you do not have a schedule or simply do not wish to use one, you can skip this step and [edit your schedule by hand](https://github.com/rsrickshaw/tamuclock#editing-the-schedule).  The schedule importer does not communicate with Howdy directly, but instead uses regular expressions to parse the text that is copied into it by the user.

![](https://github.com/rsrickshaw/tamuclock/raw/master/images/howdy.png)

# The Countdown

Once configured, TamuClock will display the name and location of the current activity and how much time is left until the activity will end.  If there is no activity currently taking place, it will display the name and location of the next upcoming activity and how much time is left until it starts.  TamuClock uses a list of all Texas A&M building abbreviations and addresses (based on the Excel file found [here](http://fcor.tamu.edu/building-room-list.aspx)) to display the relevant location on an embedded Google map.  If the countdown is between two activities, the map will display both locations with possible paths drawn between them.  TamuClock can also display non-A&M locations on the map as long as their addresses are specified.

![](https://github.com/rsrickshaw/tamuclock/raw/master/images/countdown.png)

# Editing the Schedule

Clicking on the pencil button in the lower right corner will show you an overview of the current schedule.  Here you can edit activities, add new activities, or even import a new schedule from Howdy.

![](https://github.com/rsrickshaw/tamuclock/raw/master/images/overview.png)

You can edit an activity by simply clicking on it or you can create a new activity by clicking the "+" button in the lower right corner.  This is useful for adding activities that are not listed in your Howdy schedule.  Here you can specify a name, location, time, and day of the week for this activity or delete the activity.  Note that whatever location is specified here is the one that will be shown on the map.

![](https://github.com/rsrickshaw/tamuclock/raw/master/images/edit.png)
