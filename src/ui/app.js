const { ipcRenderer } = require("electron");

const taskForm = document.querySelector('#taskForm');
const taskName = document.querySelector('#taskName');
const taskDescription = document.querySelector('#taskDescription');

const taskList = document.querySelector('#taskList');

let tasks = []; 
let updateStatus = false;
let idTaskToUpdate = '';

function deleteTask(id) {
    const result = confirm('Are you sure you want to delete it');
    if (result) {
        ipcRenderer.send('delete-task', id);
    }
    return;
}

function editTask(id) {
    updateStatus = true;
    idTaskToUpdate = id;
    const task = tasks.find(t => t._id === id);
    taskName.value = task.name;
    taskDescription.value = task.description;
    return;
}

function renderTasks(tasks) {
    taskList.innerHTML = "";
    tasks.map((t) => {
      taskList.innerHTML += `
            <li class="card">
              <h4>
                Task id: ${t._id}
              </h4>
              <p>
                Task Name: ${t.name}
              </p>
              <p>
                Task Description: ${t.description}
              </p>
              <button class="btn btn-danger" onclick="deleteTask('${t._id}')">
                🗑 Delete
              </button>
              <button class="btn btn-secondary" onclick="editTask('${t._id}')">
                ✎ Edit
              </button>
            </li>
          `;
    });
  }

taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const task = {
        name: taskName.value,
        description: taskDescription.value,
    };

    if(!updateStatus) {
        ipcRenderer.send('new-task', task);
    } else {
        ipcRenderer.send('update-task', {...task, idTaskToUpdate});
    }
    
    taskForm.reset();
});

ipcRenderer.on('new-task-created', (e, args) => {
    const newTask = JSON.parse(args);
    tasks.push(newTask);
    renderTasks(tasks);
    alert('Task created successfully')
});

ipcRenderer.send('get-tasks');

ipcRenderer.on('get-tasks', (e, args) => {
    const tasksReceived = JSON.parse(args);
    tasks = tasksReceived;
    renderTasks(tasks);
});

ipcRenderer.on('delete-task-success', (e, args) => {
    const deletedTasks = JSON.parse(args);
    const newTasks = tasks.filter(t => t._id !== deletedTasks._id);
    tasks = newTasks; 
    renderTasks(tasks);
});

ipcRenderer.on('update-task-success', (e, args) => {
    const updateTask = JSON.parse(args);
    tasks.map(t => {
        if(t._id === updateTask._id) {
            t.name = updateTask.name;
            t.description = updateTask.description;
        }
        return t;
    });
    renderTasks(tasks);
})