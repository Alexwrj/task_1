function TodoList() {
    var tasks = new Map();
    var current_id = 0;
    var addTask = function (task) {
        task.id = current_id
        tasks.set(current_id, task);
        current_id += 1;
        return task;
    }
    // JSON object
    addTask({ description: 'create todo list', completed: false});
    addTask({ description: 'add filtering by priority', completed: false});
    addTask({ description: 'use rest api backend', completed: false});

    return {
        complete_task: function (task_id) {
            task = tasks.get(parseInt(task_id, 10));
            task.completed = true;
        },
        uncomplete_task : function(task_id) {
            task = tasks.get(parseInt(task_id, 10));
            task.completed = false;
        },
        edit_task: function(task_id, description) {
            task = tasks.get(parseInt(task_id, 10));
            task.description = description;
        },
        get_task: function (task_id) {
            return tasks.get(task_id);
        },
        add_task: function (task) {
            return addTask(task);
        },
        remove_task: function (task_id) {
            return tasks.delete(parseInt(task_id, 10));
        },
        all_tasks: function () {
            return tasks.values();
        },
    }
}

var todoList = new TodoList();

function add(event) {
    // prevent form submit
    event.preventDefault();
    var description = document.getElementById('task').value;

    if (description) {
        todoList.add_task({'description': description, 'completed': false});
        showTaskList();
    }
    
    return true;
}

function getLabelById(id) {
    return $('label[id="' + id + '"]');
}

function getEditInputById(id) {
    return $('.edit-input[id="' + id + '"]');
}

function getAllInputs() {
    return $("input[type=checkbox]");
}

function changeLabel() {
    var id = this.getAttribute('id');

    getLabelById(id).hide();
    getEditInputById(id).show().focus();
    return false;
}

function labelChanged() {
    var id = this.getAttribute('id'),
        prevDescription = getLabelById(id).html();
        description = getEditInputById(id).val();

    // use prev text if the new one is not defined
    todoList.edit_task(id, description || prevDescription);
    showTaskList();
    return false;
}

function changeStatus(task_id) {
    var task = todoList.get_task(task_id);

    if (task.completed == true) {
        todoList.uncomplete_task(task_id)
    } else {
        todoList.complete_task(task_id)
    }
    showTaskList();
}

function isTaskCompleted(task_id) {
    var task = todoList.get_task(task_id);
    return task.completed;
}

function checkedProperty(task_id) {
    if (isTaskCompleted(task_id)) {
        return "checked=\"true\"";
    } else {
        return "";
    }
}

function remove() {
    var id = this.getAttribute('id');

    todoList.remove_task(id);
    showTaskList();
    return false;
}

var taskList = function() {
    var html = '';
    for (var todo of todoList.all_tasks()) {
        var onclick ="onClick=\"changeStatus(" + todo.id + ")\"",
            checked = checkedProperty(todo.id);

        html += '<div class="input-group style"><span class="input-group"><input type="checkbox" id="' + todo.id + '" ' + onclick + ' ' + checked + '><label for="checkbox" id="' + todo.id + '" class="edit">' + todo.description + '</label><input class="edit-input" id="' + todo.id + '"/></span><span class="input-group-btn"><button aria-label="Close" class="close remove" id="' + todo.id + '"><span aria-hidden="true">&times;</span></button></span></div>';
    }

    document.getElementById('todos').innerHTML = html;

    var buttons = document.getElementsByClassName('remove'),
        edit = document.getElementsByClassName('edit'),
        edit_inputs = document.getElementsByClassName('edit-input');

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', remove);
    };

    for (var i = 0; i < edit.length; i++) {
        edit[i].addEventListener('dblclick', changeLabel);
        edit[i].addEventListener('touchmove', changeLabel);
    };

    for (var i = 0; i < edit_inputs.length; i++) {
        edit_inputs[i].addEventListener('focusout', labelChanged);
    };
}

function calculateCounter() {
    var $counter = $('#counter'),
        $inputs = $("input[type=checkbox]"),
        $inputsCh = $inputs.filter(':checked'),
        tempArray = [$inputsCh.length, $inputs.length],
        // fix counter value
        informationText = tempArray[1]-tempArray[0];
    $counter.html(informationText);
}

var activeFilter = "all";

function filterByAll() {
    activeFilter = "all";
    var inputs = $("input[type=checkbox]");
    $('#allFilter').addClass("active");
    $('#completedFilter').removeClass("active");
    $('#activeFilter').removeClass("active");
    return inputs.parents().show();
}

function filterByActive() {
    activeFilter = "active";
    var $inputs = $("div input[type=checkbox]"),
        $inputsCh = $inputs.filter(":checked"),
        $inputsNotCh = $inputs.filter(":not(:checked)"),
        // change the whole row to hide
        $parentInputs = $inputsCh.parent().parent();
    $('#activeFilter').addClass("active");
    $('#allFilter').removeClass("active");
    $('#completedFilter').removeClass("active");
    return ($parentInputs.hide(), $inputsNotCh.parents().show());
}

function filterByCompleted() {
    activeFilter = "completed";
    var $inputs = $("div input[type=checkbox]"),
        $inputsCh = $inputs.filter(":checked"),
        $inputsNotCh = $inputs.filter(":not(:checked)"),
        // change the whole row to hide
        $parentInputs = $inputsNotCh.parent().parent();
    $('#completedFilter').addClass("active");
    $('#allFilter').removeClass("active");
    $('#activeFilter').removeClass("active");
    return ($parentInputs.hide(), $inputsCh.parents().show());
}

var filterTasksBy = function(filter) {
    if(activeFilter == "all") {
        filterByAll();
    } else if(activeFilter == "active") {
        filterByActive();
    } else {
        filterByCompleted();
    }
}

function showTaskList() {
    taskList();
    filterTasksBy(activeFilter);
    calculateCounter();
}

function changeInputsState(state) {
    var inputs = getAllInputs();

    for (var i = 0; i < inputs.length; i++ ) {
        inputs[i].checked=state;
        if (state) {
            todoList.complete_task(inputs[i].id);
        } else {
            todoList.uncomplete_task(inputs[i].id);
        }
        
        showTaskList();
    }
}

function selectAll() {
    changeInputsState(true);
}

function deselectAll() {
    changeInputsState(false);
}

function completedRemove() {
    var inputs = getAllInputs();

    for (var i = 0; i < inputs.length; i++ ) {
        if (inputs[i].checked == true) {
            todoList.remove_task(inputs[i].id)
        }
    }
    // optimize render
    showTaskList();
}

// handlers
document.querySelector("#allFilter").addEventListener('click', filterByAll, false);
document.querySelector("#activeFilter").addEventListener('click', filterByActive, false);
document.querySelector("#completedFilter").addEventListener('click', filterByCompleted, false);
document.getElementById('add').addEventListener('click', add);
document.querySelector("#selectAll").addEventListener('click', selectAll, false);
document.querySelector("#deselectAll").addEventListener('click', deselectAll, false);
document.querySelector("#completedRemove").addEventListener('click', completedRemove, false);

showTaskList();
