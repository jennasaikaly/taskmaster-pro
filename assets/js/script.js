console.log(moment().format());

var tasks = {};

var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // ensure it worked
  console.log(date); 

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date
  console.log(time);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {  //this is a query method (can perform simple true/false checks)
    $(taskEl).addClass("list-group-item-danger");
  }
    // apply new class if task is near/over due date
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
      $(taskEl).addClass("list-group-item-warning");
    }
};



var createTask = function(taskText, taskDate, taskList) { 
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date // doing this before appending it so that the element has all of its proper
  //classes before getting it to the page
    auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//SORTABLE
//
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  // creates a copy and moves the copy instead of the original.
// this helps prevent click events from accidentally triggering on the original
  helper: "clone", 
  //sortable event listeners:
  //triggers once for all connected lists as soon as dragging starts
  activate: function(event, ui) { 
    console.log(ui);
  },
  //triggers once for all connected lists as soon as dragging stops
  deactivate: function(event, ui) {
    console.log(ui);
  },
  //triggers when a dragged item enters a connected list
  over: function(event) {
    console.log(event);
  },
  //triggers when a dragged item leaves a connected list
  out: function(event) {
    console.log(event);
  },
  //triggers when the contents of a list have changed (i.e. reordered, removed, added)
  update: function() {
        // array to store the task data in
        var tempArr = [];
        // loop over current set of children in sortable list
        $(this)
        .children()
        .each(function() { //this 
          console.log($(this)); //this refers tothe task li child element at that index
          //saves values in temp array
          tempArr.push({
          text: $(this)
        .find("p")
        .text()
        .trim(),

        date: $(this)
        .find("span")
        .text()
        .trim()
     });
    });

    //OVERWRITE WHAT IS SAVED IN THE TASKS OBJECT
    // trim down list's ID to match object property
var arrName = $(this)
.attr("id")
.replace("list-", "");

// update array on tasks object and save
tasks[arrName] = tempArr;
saveTasks();
    },
    stop: function(event) {
      $(this).removeClass("dropover");
    }
});

//DROPABLE
// trim down list's ID to match object property
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    // remove dragged element from the dom
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log(ui);
  },
  out: function(event, ui) {
    console.log(ui);
  }

});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

//CODE TO ADD ABILITY TO EDIT TASKS//
//this is event delegation which delegates the click to the parent (.list-group)
// when the p element is clicked
$(".list-group").on("click", "p", function() {
  //gets the inner text content of the current element represented by $(this)
  var text = $(this)
  .text()  //'this' can be used on dom elements  
  .trim();  //can chain these together, trim gets rid of extra white space before or after
  console.log(text);


  //creates a dynamic element (added <>)
  var textInput = $("<textarea>")
  .addClass("form-control")
    //replaces (and appends) the existing <p> element with the new textarea 
  //when user clicks on the task description, the div will change into a textarea
  //that they can now type and edit in
  $(this).replaceWith(textInput);
//  highlights the input box
  textInput.trigger("focus");

});
//new event listener that makes anything else go blurry as soon as the user interacts
//with anything other than the textarea element
$(".list-group").on("blur", "textarea", function() {

  //STATUS VARIABLE INITIALIZATION//
// get the textarea's current value/text
var text = $(this)
  .val()
  .trim();

// get the parent ul's id attribute
var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

// get the task's position in the list of other li elements
var index = $(this)
  .closest(".list-group-item")
  .index();

  //updates teh overarching 'tasks' object with placeholders because we don't know the 
  //values ahead of time
//tasks is an object
//tasks[status] returns an array (eg toDo)
//tasks[status][index] returns the object at the given index in the array
//tasls[status][index].text returns the text property of the object at the given index
  
  tasks[status][index].text = text; //this info is needed for local storage so save tasks is called immediately after
saveTasks();

// recreate p element
var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

// replace textarea with p element
$(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element  **this is the main difference from editing task code
 
  var dateInput = $("<input>")
    .attr("type", "text") //we are using attr to get the attribute"type" and then set the attribute "text"
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      //when calendar is closed, force a "change" event on the `dateInput`
    $(this).trigger("change");
    }
  });

  // automatically focus on new element (bring up the calendar)
  dateInput.trigger("focus");
});

//changing the date area back

// value of due date was changed //was 'blur' but is now 'change'
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});

// load tasks for the first time
loadTasks();


//datepicker
$("#modalDueDate").datepicker({
  minDate: 1 // minumum date is one day from the current date
});





