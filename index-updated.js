//In this project, you will be finishing one method: createGroups().  To finish this method, you will need to be able to do the following:
//- know which students need to be grouped (done for you, stored in the students array shown below)
//- know the preferences of students (done for you, stored in the map below)
//- know the sizes of each group (done for you in the createGroups() method)
//- create an algorithm that groups students based on their preferences
//- display the results
//
//Some quick examples of javascript code using an array and a map:
//  var aStudent = students[0];
//  var id = aStudent[0]; //the 5 digit id of the student
//  var prefs = preferences[id]; //an array of ids that the studen with the given id prefers
//
//Displaying your results in the html can be a little tricky.  The createGroups() method already has
//a variable named div.  To add some simple information to display on the webpage, you could write code like this:
//  div.innerHTML = "Hi mom<br>";
//  div.innerHTML += "What's up";
//
//You are more than welcome to investigate more advanced ways to format your ouput



//A 2D array - each row is of length 2, where index 0 is the first name, and index 1 is the last name
var teacherNames = [];

//A 2D array - each row is of length 3, where index 0 is the period, index 1 is the class code, and index 2 is the class name
var classes = [];

//A 2D array - each row is of length 4, where index 0 is the id, index 1 is the first name, index 2 is the last name, and index 3 is the email
var students = [];

//map from student ids to an array of ids the student prefers
var preferences = {};

/*********************************/
//local caching of teacher names
/*********************************/
window.onload = function() {
    if(!localStorage.getItem('teacherNames')) {
      readTeachers();
    } else {
      teacherNames = JSON.parse(localStorage.getItem('teacherNames'));
      showTeachers();
    }
}


//Example Test Cases
//readClasses("Martha", "Lietz");
//readStudents("Martha", "Lietz", "03");
//readPreferences("Martha", "Lietz", "03");


//A function that reads in all Teachers that are teaching a class
//at Niles West this year.  Currently only prints out the results
//to the console.  Do NOT return in this function as it makes an
//asynchronous call to a database.
function readTeachers() {
    
    var request = new XMLHttpRequest();
    request.open("POST", "http://fahrenbacher.com/groups/teachers.php");
    request.onreadystatechange = function ()
    {
        if(request.readyState === 4)
        {
            if(request.status === 200 || request.status === 0)
            {
                //the result String will be in the following format:
                //  <teacher first name>,<teacher last name>\n
                //
                //i.e.   Matthew,Fahrenbacher
                //       AMBER,MOSIER
                //
                //Sometimes teacher names are capitalized in weird ways
                //Sometimes the first name includes the middle initial
                //Sometimes teachers have hyphenated names
                //
                //Two weird entries will be a teacher with an empty string
                //  for both first and last names (this is for scheduled
                //  things that are not classes), and a Teacher who has a
                //  first name fo Niles and a last name of STAFF (similar
                //  to the previous weird case);
                //
                //Also, this data is not sorted...
                var result = request.responseText;
                
                teacherNames = [];
                var names = result.split("\n");
                for(var i = 0; i < names.length - 1; i++) { //last line has no data
                    teacherNames.push(names[i].split(","));
                }
                
                /*********************************/
                //save teacher names to the cache
                /*********************************/
                localStorage.setItem("teacherNames", JSON.stringify(teacherNames));
                
                showTeachers();
                
            }
            else {
                reportError("Error reading teachers");
            }
        }
    }
    request.send();
    
}

//displays all the teachers in a select element
function showTeachers() {
    var select = document.getElementById("teachers");
    select.innerHTML = "";
    
    for(var i = 0; i < teacherNames.length; i++) {
        var option = document.createElement("option");
        option.text = teacherNames[i][0] + " " + teacherNames[i][1];
        select.appendChild(option);
    }
    
    chooseTeacher();
}

function chooseTeacher() {
    var select = document.getElementById("teachers");
    var index = select.selectedIndex;
    
    readClasses(teacherNames[index][0], teacherNames[index][1]);
}


//A function that reads in all Class that a given teacher is teaching
//at Niles West this year.  Currently only prints out the results
//to the console.  Do NOT return in this function as it makes an
//asynchronous call to a database.
function readClasses(teacherFirstName, teacherLastName) {

    /*********************************/
    //local caching of class names
    /*********************************/
    if(localStorage.getItem('classes' + teacherFirstName + teacherLastName)) {
      classes = JSON.parse(localStorage.getItem('classes' + teacherFirstName + teacherLastName));
      showClasses();
      return;
    }
    
    var formData = new FormData();
    formData.append("teacherFirst", teacherFirstName);
    formData.append("teacherLast", teacherLastName);
    
    var request = new XMLHttpRequest();
    request.open("POST", "http://fahrenbacher.com/groups/classes.php");
    request.onreadystatechange = function ()
    {
        if(request.readyState === 4)
        {
            if(request.status === 200 || request.status === 0)
            {
                //the result String will be in the following format:
                //  <period>,<class code>,<class name>\n
                //
                //i.e.   02,IT2A07,Advance App Development
                //       03,IT2C05,AP Comp Sci A
                //
                //Valid periods include HR, AS, BS
                //
                //Double period classes WILL appear twice, for example:
                //
                //  08,SC2P05,AP Physics C
                //  09,SC2P05,AP Physics C
                //
                //Also... it might be nice to sort the data by period...
                var result = request.responseText;
                
                classes = [];
                var cs = result.split("\n");
                for(var i = 0; i < cs.length - 1; i++) { //last line has no data
                    classes.push(cs[i].split(","));
                }
                
                /*********************************/
                //save classes to the cache
                /*********************************/
                localStorage.setItem("classes" + teacherFirstName + teacherLastName, JSON.stringify(classes));
                
                showClasses();
            }
            else {
                reportError("Error reading classes");
            }
        }
    }
    request.send(formData);
}

function showClasses() {
    var select = document.getElementById("classes");
    select.innerHTML = "";
    
    for(var i = 0; i < classes.length; i++) {
        var option = document.createElement("option");
        option.text = classes[i][2] + ", Period " + classes[i][0];
        select.appendChild(option);
    }
    
    chooseClass();
}

function chooseClass() {
    var select = document.getElementById("teachers");
    var index = select.selectedIndex;
    
    var teacherFirstName = teacherNames[index][0];
    var teacherLastName = teacherNames[index][1];

    select = document.getElementById("classes");
    index = select.selectedIndex;
    
    var period = classes[index][0];
    
    readStudents(teacherFirstName, teacherLastName, period);
}

//A function that reads in all Students that a given teacher is teaching
//at Niles West this year in the given period.  Currently only prints out the results
//to the console.  Do NOT return in this function as it makes an
//asynchronous call to a database.
function readStudents(teacherFirstName, teacherLastName, period) {

    /*********************************/
    //local caching of students
    /*********************************/
    if(localStorage.getItem('students' + teacherFirstName + teacherLastName + period)) {
      students = JSON.parse(localStorage.getItem('students' + teacherFirstName + teacherLastName + period));
      
      var groupSelect = document.getElementById("studentsToGroup");
      groupSelect.innerHTML = "";
      
      for(var i = 0; i < students.length; i++) {
            var stud = students[i];
            
            option = document.createElement("option");
            option.value = stud[0];
            option.selected = true;
            option.text = stud[1] + " " + stud[2]
            groupSelect.add(option);
      }

      document.getElementById("studentCount").innerHTML = students.length;
      
      showPreferences();
      return;
    }

    var formData = new FormData();
    formData.append("teacherFirst", teacherFirstName);
    formData.append("teacherLast", teacherLastName);
    formData.append("period", period);
    
    var request = new XMLHttpRequest();
    request.open("POST", "http://fahrenbacher.com/groups/students.php");
    request.onreadystatechange = function ()
    {
        if(request.readyState === 4)
        {
            if(request.status === 200 || request.status === 0)
            {
                //the result String will be in the following format:
                //  <student id>,<student first name>,<student last name>,<student email>\n
                var result = request.responseText;
                
                var groupSelect = document.getElementById("studentsToGroup");
                groupSelect.innerHTML = "";
                
                students = [];
                var ss = result.split("\n");
                for(var i = 0; i < ss.length - 1; i++) { //last line has no data
                    var stud = ss[i].split(",");
                    students.push(stud);
                }
                
                /*********************************/
                //save students to the cache
                /*********************************/
                localStorage.setItem('students' + teacherFirstName + teacherLastName + period, JSON.stringify(students));
                
                for(var i = 0; i < students.length; i++) {
                    var stud = students[i];
                    
                    option = document.createElement("option");
                    option.value = stud[0];
                    option.selected = true;
                    option.text = stud[1] + " " + stud[2]
                    groupSelect.add(option);
                }
                
                document.getElementById("studentCount").innerHTML = students.length;
                
                showPreferences();
            }
            else {
                reportError("Error reading students");
            }
        }
    }
    request.send(formData);
}

function showPreferences() {
    var select = document.getElementById("teachers");
    var index = select.selectedIndex;
    
    var teacherFirstName = teacherNames[index][0];
    var teacherLastName = teacherNames[index][1];

    select = document.getElementById("classes");
    index = select.selectedIndex;
    
    var period = classes[index][0];
    
    readPreferences(teacherFirstName, teacherLastName, period);
}

//Function that can be used to read in all preferences that students in a class
//have recorded.  Do NOT return in this function as it makes an
//asynchronous call to a database.
function readPreferences(teacherFirstName, teacherLastName, period) {

    /*********************************/
    //local caching of preferences
    /*********************************/
    if(localStorage.getItem('preferences' + teacherFirstName + teacherLastName + period)) {
      var result = JSON.parse(localStorage.getItem('preferences' + teacherFirstName + teacherLastName + period));
      displayPreferences(result);
      return;
    }

    var formData = new FormData();
    formData.append("teacherFirst", teacherFirstName);
    formData.append("teacherLast", teacherLastName);
    formData.append("period", period);
    
    var request = new XMLHttpRequest();
    request.open("POST", "http://fahrenbacher.com/groups/readPreferences.php");
    request.onreadystatechange = function ()
    {
        if(request.readyState === 4)
        {
            if(request.status === 200 || request.status === 0)
            {
                //the result String will be in the following format:
                //  <student id>,<id of preferred student>,<id of preferred student>,...,<id of preferred student>\n
                //
                //Not all students may show up in the output (if they have selected no one and no
                //   no one has selected them).  It will be important to have the full list of students
                //   read in as well to get the missing students, as well as to identify names
                var result = request.responseText;
                localStorage.setItem('preferences' + teacherFirstName + teacherLastName + period, JSON.stringify(result));

                displayPreferences(result);
            }
            else {
                reportError("Error reading preferences");
            }
        }
    }
    request.send(formData);
}

function displayPreferences(result) {
    var div = document.getElementById("preferences");
    div.innerHTML = "";
    preferences = {};
    
    var ss = result.split("\n");
    for(var i = 0; i < ss.length - 1; i++) { //last line has no data
    
        var data = ss[i].split(",");
        var chooser = data[0];
        data.shift(); //remove first person
        
        preferences[chooser] = data; //make a map from the student id to a list of ids of students they prefer
    
        var p = document.createElement('p');
        p.innerHTML = nameOfStudentWithId(chooser) + ": ";
        
        for(var j = 0; j < data.length; j++) {
            p.innerHTML += nameOfStudentWithId(data[j]);
            
            if(j != data.length - 1)
                p.innerHTML += ", ";
        }
        
        div.appendChild(p);
    }
}



/********************/
/*     TO DO        */
/********************/
//Useful data
// 2D array named students - each row is a student in the class
//                         - the columns are the id, first name, last name, and email
// Map named preferences   - each key is the id of a student
//                         - each value is an array of ids that the student prefers
//                           Note: not every student will necessarially have picked people!
function createGroups() {
    
	
    //where to display your results
    var div = document.getElementById("groups");
	
    
    //this block of code determines which students should be grouped
    //toGroup will be a subset of the full stundets array
    //toGroups values are selected by the user interface
	
    var toGroup = [];
    select = document.getElementById("studentsToGroup");
	
    var count = 0;
    for(var i = 0; i < select.length; i++) {
        if(select.options[i].selected) {
            toGroup.push(students[i]);
            count++;
        }
    }
	// algorithm takes at most 50 seconds
    var listofids = []
	var listofnames = []
	var idtoname = {}
	for (var i=0; i<toGroup.length; i++){
		listofids[i] = toGroup[i][0] 
		idtoname[toGroup[i][0]] = toGroup[i][1]
	}
	var newprefs = {}
	for (var i in preferences){
		newprefs[i] = preferences[i].slice()
		
	}
    //array of how large each group should be - null if the user entered the data incorrectly
    //the sum of all the group sizes will match the length of the students array
    var sizes = groupSizes(count);
    
    if(sizes == null)
        return;

    //Your job - group the students based on their preferences and the group sizes the teacher has selected
    
    //This is an array.  Each group that you form should be stored in an array which is then pushed into the groups array
    //i.e. this is really going to be a 2D array).
    //Each row should contain the ids numbers of students in the same group
    var groups = [];
    
    //naive approach - just create groups in order
   
	sizes.sort();
	sizes.reverse();
    var thelist = []
	for (var i=0; i<toGroup.length; i++){
		thelist.push(toGroup[i][0])
	}
	// 1. separate groups into 2 parts
	// 2. get the optimal combination of the 2 parts using n choose k
	// 3. do the separation again but with smaller parts of the list
	function drive(realarr, arr, l, r, l2, r2){
		
		// l is first group and r is last group
		if (l2 == r2){
			
			return 
		}
		var left = []
		var right = []
		var stop = 0
		var fullsum = arr.length
		
		var thissum = 0
		for (var i=l2; i<=r2; i++){
			thissum += sizes[i]
			if (thissum > fullsum-thissum){
				console.log(thissum)
				console.log(fullsum)
				console.log("FI")
				stop = i
				if (thissum == fullsum){
					stop -= 1;
					thissum -= sizes[i]
				}
				
			}
		}
		var combination = []
		var bestgroups = []
		var bestscore = -1
		var cnt = 0
		function nchoosek(n, offset, k){ // n is amount in given list
			if (cnt > 2704156){ // stop at 24 choose 12, more takes too long
				return
			}
			if (k == 0){
				cnt++
				//process combination
				var tempgroups = [[], []]
				var start = 0;
				for (var i=0; i<n; i++){
					if (i == combination[start]){
						start++
						tempgroups[0].push(arr[i])
					}else{
						tempgroups[1].push(arr[i])
					}
				}
				var sco = score(tempgroups)

				if (sco > bestscore){
				
					bestscore = sco
					bestgroups = tempgroups
				}
				
			}else{
			
				for (var i=offset; i<n-k; i++){
					combination.push(i)
					nchoosek(n, i+1, k-1)
					combination.pop()
				}
			}
		}
		nchoosek(arr.length, 0, thissum)
		// separate into left and right
		for (var i=0; i<bestgroups[0].length; i++){
			left[i] = bestgroups[0][i]
		}
		for (var i=0; i<bestgroups[1].length; i++){
			right[i] = bestgroups[1][i]
		}
		// overwrite the real array
		var cnt = 0
		for (var i=l; i<thissum+l; i++){
			realarr[i] = left[cnt]
			
			cnt++
		}
		cnt = 0
		for (var i=thissum+l; i<=r; i++){
			realarr[i] = right[cnt]
			
			cnt++
		}
		// separate the left and right into 2 groups
		drive(realarr, left, l, l+thissum-1, l2, stop)
		drive(realarr, right, l+thissum+1, r, stop+1, r2);
		console.log(left)
		console.log(right)
		console.log ("ASDF")
	}
	drive(thelist, thelist, 0, thelist.length-1, 0, sizes.length-1)
	console.log(thelist)
	// the array fits into the sizes list
	var cnt = 0
	for (var i=0; i<sizes.length; i++){
		groups.push([])
		for (var j=0; j<sizes[i]; j++){
			groups[i].push(thelist[cnt])
			cnt++
		}
	}
	//maximize
	var curscore = score(groups);
	for (var i=0; i<groups.length; i++){
		for (var j=0; j<groups.length; j++){
			for (var k=0; k<groups[i].length; k++){
				for (var l=0; l<groups[j].length; l++){
					// exchange k and l
					// somehow exchanging ppl in same group can raise score
					var temp = groups[i][k]
					groups[i][k] = groups[j][l]
					groups[j][l] = temp
					var thisscore = score(groups)
					console.log(thisscore)
					if (thisscore > curscore){
						curscore = thisscore
	
					}else{
						temp = groups[i][k]
						groups[i][k] = groups[j][l]
						groups[j][l] = temp
					}
				}
			}
		}
	}
	var res1 = score(groups)
	var res1list = groups
	groups = []
	var graph = {}; // map of ids to two arrays, one array is mutuals and other means one person happy
	
	for (var i=0; i<listofids.length; i++){
		var curr = listofids[i];
		
		var prefs = newprefs[curr];
		var temp = -1;
		if (prefs == null || prefs == undefined || prefs[0] == ""){
			
			prefs = listofids.slice()
			newprefs[curr] = listofids.slice()
			
			for (var j=0; j<listofids.length; j++){
				if (curr == listofids[j]){
					prefs.splice(j, 1)
					newprefs[curr].splice(j, 1)
					break;
				}
			}
			temp = prefs.slice()
		}else{
			temp = newprefs[curr].slice()
		
		}
	
		
		graph[listofids[i]] = [[], temp];
		
	}
	
	// add mutuals
	
	for (var i=0; i<listofids.length; i++){
		var curr = listofids[i];
		var prefs = newprefs[curr];
		
		for (var j=0; j<prefs.length; j++){
			var theirprefs = newprefs[prefs[j]];
		
			
			for (var k=0; k<theirprefs.length; k++){
				if (theirprefs[k] == curr){
					
					graph[curr][0].push(prefs[j])
					
					break;
				}
			}
		}
	}
	
	// delete ones in +1 happiness list that are in mutuals
	for (var i=0; i<listofids.length; i++){
		var mutuals = graph[listofids[i]][0]
		var onehappy = graph[listofids[i]][1]
		
		for (var j=0; j<mutuals.length; j++){
			var cur = mutuals[j]
			for (var k=0; k<onehappy.length; k++){
				if (onehappy[k] == cur){
					onehappy.splice(k, 1)
					break
				}
			}
		}
	}
	
	// add people who want them but not mutual
	
	var newgraph = {}
	for (var i in graph){
		newgraph[i] = graph[i].slice()
		newgraph[i][0] = graph[i][0].slice();
		newgraph[i][1] = graph[i][1].slice();
	}

	for (var i=0; i<listofids.length; i++){
		var curname = listofids[i]
		var onehappy = newgraph[curname][1]
		
		for (var j=0; j<listofids.length; j++){
			var cur = graph[listofids[j]][1]
			for (var k=0; k<cur.length; k++){
				if (cur[k] == curname){
					onehappy.push(listofids[j])
					break
				}
				
			}
		}
		
	}
	
	// delete all in mutuals and one happiness
	function delet(id, extragraph, extralistofids){
		delete extragraph[id]
		for (var i=0; i<extralistofids.length; i++){
			if (extralistofids[i] == id){
				extralistofids.splice(i, 1);
				break
			}
		}
		for (var i=0; i<extralistofids.length; i++){
			
			var graph1 = extragraph[extralistofids[i]][0]
			for (var j=0; j<graph1.length; j++){
				if (graph1[j] == id){
					graph1.splice(j, 1)
					break
				}
			}
			var graph2 = extragraph[extralistofids[i]][1]
			for (var j=0; j<graph2.length; j++){
				if (graph2[j] == id){
					graph2.splice(j, 1)
					break
				}
			}
		}
	}
	var permutations = []
	var chosen = Array(sizes.length)
    var maxx = 0;
	// create permutations up to 6 numbers and run algorithm because more than 6 is slow
	// algorithm is 
	// 1. search people with lowest mutuals
	// 2. search the lowest mutuals for lowest people all together
	// 3. choose person
	// 4. with chosen person, place them in the group, then go to their mutuals if they have any
	// 5. go to the mutual that has the least mutuals and then least people
	// 6. if there's no mutuals go to +1 happys (where 1 person turns happy)
	// 7. if none to choose from choose from big list again
	// 8. delete stuff as it goes (as you place it in the list)
	// repeat
	function search(){
		if (permutations.length == sizes.length || permutations.length == 6){
			if (sizes.length > 6){
				for (var i=6; i<sizes.length; i++){
					permutations.push(i)
				}
			}
			
			var newgraphcopy = {}
			var listofidscopy = listofids.slice()
			var thisgroups = []
			for (var i in newgraph){
				newgraphcopy[i] = newgraph[i].slice()
				newgraphcopy[i][0] = newgraph[i][0].slice();
				newgraphcopy[i][1] = newgraph[i][1].slice();
			}
			for (var i=0; i<permutations.length; i++){
				// find lowest mutuals size
				var curr = sizes[permutations[i]];
				var lowest = 10000
				var tofill = [];
				for (var j=0; j<listofidscopy.length; j++){
					var curid = listofidscopy[j];
					var size = newgraphcopy[curid][0].length
					if (size < lowest){
						lowest = size
					}
				}
				// find one with lowest mutuals size and lowest person size
				var lowest2 = 10000;
				var id = -1
				for (var j=0; j<listofidscopy.length; j++){
					var curid = listofidscopy[j];
					var size = newgraphcopy[curid][0].length
					if (size == lowest){
						if (newgraphcopy[curid][1].length < lowest2){
							lowest2 = newgraphcopy[curid][1].length
							id = curid
						}
					}
				}
				tofill.push(id)
				if (curr == 1){
					delet(id, newgraphcopy, listofidscopy)
					thisgroups.push(tofill)
					continue;
				}
				
				var currnum = 1; // amount of ppl currently in group
				
				while (currnum < curr){ // less than group size
					var mutuals = newgraphcopy[id][0].slice();
					var onehappy = newgraphcopy[id][1].slice();
					delet(id, newgraphcopy, listofidscopy)
					if (mutuals.length != 0){
						var lowmutuals = 10000;
						var lowppl = 10000;
						var idd = -1
						for (var j=0; j<mutuals.length; j++){
							if (newgraphcopy[mutuals[j]][0].length < lowmutuals && newgraphcopy[mutuals[j]][1].length < lowppl){
								lowmutuals = newgraphcopy[mutuals[j]][0].length
								lowppl = newgraphcopy[mutuals[j]][1].length
								idd = mutuals[j];
							}
						}
						tofill.push(idd)
						currnum += 1
						id = idd;
					}else{
						if (onehappy.length != 0){
							var lowppl = 1000
							var idd = -1;
							for (var j=0; j<onehappy.length; j++){
								if (newgraphcopy[onehappy[j]].length < lowppl){
									lowppl = newgraphcopy[onehappy[j]].length
									idd = onehappy[j]
								}
							}
							tofill.push(idd)
							currnum += 1
							id = idd;
						}else{
							var lowmutuals = 1000
							var lowppl = 1000
							var idd = -1
							for (var j=0; j<listofidscopy.length; j++){
								if (newgraphcopy[listofidscopy[j]][0].length < lowmutuals && newgraphcopy[listofidscopy[j]][1].length < lowppl){
									lowmutuals = newgraphcopy[listofidscopy[j]][0].length
									lowppl = newgraphcopy[listofidscopy[j]][1].length
									idd = listofidscopy[j]
								}
							}
							tofill.push(idd)
							currnum += 1
							id = idd;
						}
						
					}
					
				}
				thisgroups.push(tofill)
				delet(id, newgraphcopy, listofidscopy)
				
				
			}
			var scorre = score(thisgroups)
			if (scorre > maxx){
				maxx = scorre
				groups = thisgroups.slice()
			}
			for (var i=6; i<sizes.length; i++){
					permutations.pop()
				
			}
		}else{
			
			for (var i = 0; i < Math.min(6, sizes.length); i++) {
				if (chosen[i] == true) continue;
				chosen[i] = true;
				permutations.push(i);
				search();
				chosen[i] = false;
				permutations.pop();
			}
		}

	}
	search()
	// exchange ppl between groups to raise score
	// this algo works good on it's own
	var curscore = score(groups);
	for (var i=0; i<groups.length; i++){
		for (var j=0; j<groups.length; j++){
			for (var k=0; k<groups[i].length; k++){
				for (var l=0; l<groups[j].length; l++){
					// exchange k and l
					// somehow exchanging ppl in same group can raise score
					var temp = groups[i][k]
					groups[i][k] = groups[j][l]
					groups[j][l] = temp
					var thisscore = score(groups)
					console.log(thisscore)
					if (thisscore > curscore){
						curscore = thisscore
	
					}else{
						temp = groups[i][k]
						groups[i][k] = groups[j][l]
						groups[j][l] = temp
					}
				}
			}
		}
	}
	
	if (score(groups) > res1){
		
		//display the groups that were created
		console.log(score(groups));//displays the average happiness of people in groups
		for (var i=0; i<groups.length; i++){
			for (var j=0; j<groups[i].length; j++){
				groups[i][j] = idtoname[groups[i][j]];
			}
		}
		var groupsDiv = document.getElementById("groups");
		for(var i = 0; i < groups.length; i++) {
			var p = document.createElement("p");
			p.innerHTML = groups[i];
			groupsDiv.appendChild(p);
			
		}
		
		var p = document.createElement("p");
		p.innerHTML = "=========";
		groupsDiv.appendChild(p);
		
	}else{
	
		//display the groups that were created
		
		console.log(res1);//displays the average happiness of people in groups
		for (var i=0; i<res1list.length; i++){
			for (var j=0; j<res1list[i].length; j++){
				res1list[i][j] = idtoname[res1list[i][j]];
			}
		}
		var groupsDiv = document.getElementById("groups");
		for(var i = 0; i < res1list.length; i++) {
			var p = document.createElement("p");
			p.innerHTML = res1list[i];
			groupsDiv.appendChild(p);
		}
		var p = document.createElement("p");
		p.innerHTML = "=========";
		groupsDiv.appendChild(p);
		
		
		
	}
	/**/
}

//groups is an array of arrays (2D array) where each row is a group, and every element in a row is an id number
//precondition - all grops are of the correct size requested by the user of the program
function score(groups) {

    var averageHappiness = 0;
    var numStudents = 0;
    for(var i = 0; i < groups.length; i++) {
        var group = groups[i];
        numStudents += group.length;
        
        for(var j = 0; j < group.length; j++) {
            
            var id = group[j];
            var prefs = preferences[id];
            
            var count = 0;
            
            if(prefs != undefined) {
                for(var k = 0; k < group.length; k++) {
                    if(j != k) {
                        if(prefs.indexOf(group[k]) != -1)
                            count++;
                    }
                }
            }
            
            //1 person group is auto happy
            if(group.length == 1) {
                averageHappiness += 1;
            }
            else {
                var percentHappy = count / (group.length - 1);
                averageHappiness += percentHappy;
            }
        }
    }
    
    averageHappiness /= numStudents;
    return averageHappiness;
}

//returns the name of a student with the given id
function nameOfStudentWithId(id) {
    for(var i = 0; i < students.length; i++) {
        if(students[i][0] == id)
            return students[i][1] + " " + students[i][2];
    }
    
    return id;
}

//reads the size of groups that the user has selected to create
function groupSizes(target) {
    var input = document.getElementById("sizes").value;
    
    if(input == "") {
        reportError("Make sure you enterd the desired group sizes!");
        return null;
    }
    
    var split = input.split(",");
    
    var sizes = [];
    for(var i = 0; i < split.length; i++) {
        sizes.push(parseInt(split[i]));
    }
        
    var count = 0;
    for(var i = 0; i < sizes.length; i++) {
        count += sizes[i];
    }
    
    if(count != target) {
        reportError("The sum of your group sizes is " + count + ", but there are " + students.length + " students in your class!");
        return null;
    }
    
    return sizes;
}

function reportError(error) {
    alert(error);
}

