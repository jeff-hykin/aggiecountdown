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



function ParseThis(howdy_text)
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




// this is where you put your howdy text to test it 
stuff_to_parse = `
Search   
    
Student Schedule

        
Transparent Image
[Change Schedule Term] [Review/Order Books]
NOTE: The Student Schedule includes only courses taught in a "regular" term (Fall, Spring, 1st Summer Session, 2nd Summer Session, or 10-week Summer Term). Regular terms have start and end dates defined in the official Academic Calendar. Intrasession and intersession (mini-mester) courses with different start and end dates are not displayed on the Student Schedule.
Schedule for Jeffrey Hykin - Spring 2018

Course	Title	Campus	Dates/Times	Instructor	Credits	Location	Level	Type
BIOL-111-507	INTRODUCTORY BIOLOGY I 
CS	16-JAN-2018 to 08-MAY-2018
09:10 AM - 10:00 AM
MO,WE,FR	Wei Wan	4	BSBE 115	UG	LEC
CS	16-JAN-2018 to 08-MAY-2018 
06:30 PM - 09:20 PM
WE	Wei Wan		HELD 314	UG	LAB
COMM-203-522	PUBLIC SPEAKING 
CS	16-JAN-2018 to 08-MAY-2018
04:10 PM - 05:25 PM
MO,WE	Thomas Adams	3	BLOC 134	UG	LEC
CSCE-221-511	DATA STRUC & ALGORITHM 
CS	16-JAN-2018 to 08-MAY-2018
10:20 AM - 11:10 AM
MO,WE,FR	Teresa Leyk	4	ETB 2005	UG	LEC
CS	16-JAN-2018 to 08-MAY-2018 
03:00 PM - 03:50 PM
MO,WE	Teresa Leyk		RDMC 111A	UG	LAB
ENGR-482-904	ETHICS AND ENGINEERING 
CS	16-JAN-2018 to 08-MAY-2018
08:00 AM - 09:15 AM
TU	Ray James	3	EABA 121	UG	LEC
CS	16-JAN-2018 to 08-MAY-2018 
03:00 PM - 04:50 PM
FR	Ray James		TBD	UG	LAB
MATH-302-502	DISCRETE MATHEMATICS 
CS	16-JAN-2018 to 08-MAY-2018
11:30 AM - 12:20 PM
MO,WE,FR	Huafei Yan	3	BLOC 164	UG	LEC

17
Show All Buildings on Map
[Change Schedule Term] [Review/Order Books]
Concise Schedule | Detailed Schedule | Week at a Glance | Graphic Schedule |

Transparent Image
6`


console.log( ParseThis(stuff_to_parse) )
