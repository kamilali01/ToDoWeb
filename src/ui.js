import { format, parseISO, isValid, isToday, isPast } from 'date-fns';
import * as appLogic from './appLogic.js';

// --- DOM Element References ---
let projectsListElement;
let projectTitleElement;
let todosListElement;
let addProjectButton;
let newProjectInput;
let addTodoButton;
let todoDialog;
let todoForm;
let closeDialogButton;
let dialogTitle;
let deleteProjectButton; // Added for deleting the current project
let themeToggleBtn; // Added for theme toggling

// --- Theme Toggling --- START
const THEME_STORAGE_KEY = 'todoApp.theme';
let currentTheme = 'light'; // Default theme

function saveThemePreference() {
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
}

function loadThemePreference() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme) {
        currentTheme = storedTheme;
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    // Update button text/icon
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    saveThemePreference();
}
// --- Theme Toggling --- END

// --- Initialization ---
export function initializeUI() {
    console.log("Initializing UI...");
    // Create basic HTML structure dynamically
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <div class="app-container">
            <aside class="sidebar">
                <h2>Projects</h2>
                <ul id="projects-list"></ul>
                <div class="add-project-form">
                    <input type="text" id="new-project-name" placeholder="New project name...">
                    <button id="add-project-btn">+</button>
                </div>
                <button id="theme-toggle-btn" class="btn theme-toggle-btn"></button>
            </aside>
            <main class="main-content">
                <header class="project-header">
                    <h2 id="project-title"></h2>
                    <button id="delete-project-btn" class="danger-btn">Delete Project</button> 
                </header>
                <ul id="todos-list"></ul>
                <button id="add-todo-btn" class="add-btn">+ Add Todo</button>
            </main>
        </div>

        <dialog id="todo-dialog">
            <form id="todo-form" method="dialog">
                <h3 id="dialog-title">Add New Todo</h3>
                <input type="hidden" id="todo-id" name="todoId">
                <input type="hidden" id="project-id" name="projectId">

                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>

                <label for="description">Description:</label>
                <textarea id="description" name="description"></textarea>

                <label for="dueDate">Due Date:</label>
                <input type="date" id="dueDate" name="dueDate" required>

                <label for="priority">Priority:</label>
                <select id="priority" name="priority" required>
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>

                <label for="notes">Notes:</label>
                <textarea id="notes" name="notes"></textarea>

                <!-- Checklist might be added later -->

                <div class="dialog-actions">
                    <button type="submit" id="save-todo-btn">Save</button>
                    <button type="button" id="close-dialog-btn">Cancel</button>
                </div>
            </form>
        </dialog>
    `;

    // Get references after creating elements
    projectsListElement = document.getElementById('projects-list');
    projectTitleElement = document.getElementById('project-title');
    todosListElement = document.getElementById('todos-list');
    addProjectButton = document.getElementById('add-project-btn');
    newProjectInput = document.getElementById('new-project-name');
    addTodoButton = document.getElementById('add-todo-btn');
    todoDialog = document.getElementById('todo-dialog');
    todoForm = document.getElementById('todo-form');
    closeDialogButton = document.getElementById('close-dialog-btn');
    dialogTitle = document.getElementById('dialog-title');
    deleteProjectButton = document.getElementById('delete-project-btn');
    themeToggleBtn = document.getElementById('theme-toggle-btn'); // Get theme toggle button

    // Add event listeners
    addProjectButton.addEventListener('click', handleAddProject);
    newProjectInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddProject();
        }
    });
    addTodoButton.addEventListener('click', openAddTodoDialog);
    closeDialogButton.addEventListener('click', () => todoDialog.close());
    todoForm.addEventListener('submit', handleSaveTodo);
    deleteProjectButton.addEventListener('click', handleDeleteProject); // Listener for delete project
    projectsListElement.addEventListener('click', handleProjectSelection);
    todosListElement.addEventListener('click', handleTodoActions); // Delegate actions like delete, edit, toggle
    themeToggleBtn.addEventListener('click', toggleTheme); // Add event listener for theme toggle

    // Load theme preference on init
    loadThemePreference();
    applyTheme(currentTheme); // Set initial theme

    // Initial render
    renderProjects();
    renderCurrentProjectTodos();
}

// --- Rendering Functions ---

function renderProjects() {
    const projects = appLogic.getAllProjects();
    const currentProjectId = appLogic.getCurrentProject()?.id;
    projectsListElement.innerHTML = ''; // Clear existing list

    if (projects.length === 0) {
        projectsListElement.innerHTML = '<li>No projects yet.</li>';
        return;
    }

    projects.forEach(project => {
        const li = document.createElement('li');
        li.textContent = project.name;
        li.dataset.projectId = project.id;
        if (project.id === currentProjectId) {
            li.classList.add('active');
        }
        projectsListElement.appendChild(li);
    });
}

function renderCurrentProjectTodos() {
    const currentProject = appLogic.getCurrentProject();
    todosListElement.innerHTML = ''; // Clear existing list

    if (!currentProject) {
        projectTitleElement.textContent = 'No Project Selected';
        deleteProjectButton.style.display = 'none'; // Hide delete if no project
        todosListElement.innerHTML = '<li>Select or create a project to see todos.</li>';
        return;
    }

    projectTitleElement.textContent = currentProject.name;
    deleteProjectButton.style.display = 'inline-block'; // Show delete button
    // Disable delete for 'Default' project
    deleteProjectButton.disabled = currentProject.name === 'Default'; 

    const todos = currentProject.getAllTodos();

    if (todos.length === 0) {
        todosListElement.innerHTML = '<li>No todos in this project yet. Add one!</li>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.classList.add(`priority-${todo.priority}`);
        if (todo.completed) {
            li.classList.add('completed');
        }
        li.dataset.todoId = todo.id;
        li.dataset.projectId = currentProject.id;

        // Basic Todo Info
        const todoInfo = document.createElement('div');
        todoInfo.classList.add('todo-info');
        
        const titleSpan = document.createElement('span');
        titleSpan.classList.add('todo-title');
        titleSpan.textContent = todo.title;
        
        const dateSpan = document.createElement('span');
        dateSpan.classList.add('todo-dueDate');
        try {
            // Check if dueDate is a valid date object before formatting
            if (todo.dueDate && isValid(todo.dueDate)) {
                dateSpan.textContent = format(todo.dueDate, 'MMM do');
                if (isPast(todo.dueDate) && !isToday(todo.dueDate) && !todo.completed) {
                    dateSpan.classList.add('overdue');
                }
            } else {
                dateSpan.textContent = 'No date';
            }
        } catch (e) {
            console.error("Error formatting date:", todo.dueDate, e);
            dateSpan.textContent = 'Invalid date';
        }

        todoInfo.appendChild(titleSpan);
        todoInfo.appendChild(dateSpan);

        // Action Buttons
        const todoActions = document.createElement('div');
        todoActions.classList.add('todo-actions');

        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.innerHTML = todo.completed ? '&#x21B6;' : '&#x2713;'; // Undo / Checkmark
        completeBtn.title = todo.completed ? 'Mark as Incomplete' : 'Mark as Complete';
        completeBtn.dataset.action = 'toggleComplete';

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '&#x270E;'; // Pencil
        editBtn.title = 'Edit Todo';
        editBtn.dataset.action = 'edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn', 'danger-btn');
        deleteBtn.innerHTML = '&times;'; // Multiplication X
        deleteBtn.title = 'Delete Todo';
        deleteBtn.dataset.action = 'delete';

        todoActions.appendChild(completeBtn);
        todoActions.appendChild(editBtn);
        todoActions.appendChild(deleteBtn);

        // Details (Initially Hidden)
        const todoDetails = document.createElement('div');
        todoDetails.classList.add('todo-details');
        todoDetails.style.display = 'none'; // Hidden by default
        todoDetails.innerHTML = `
            <p><strong>Description:</strong> ${todo.description || 'N/A'}</p>
            <p><strong>Priority:</strong> ${todo.priority}</p>
            <p><strong>Due:</strong> ${todo.dueDate && isValid(todo.dueDate) ? format(todo.dueDate, 'yyyy-MM-dd') : 'No date'}</p>
            <p><strong>Notes:</strong> ${todo.notes || 'N/A'}</p>
            <!-- Checklist display can be added here -->
        `;

        li.appendChild(todoInfo);
        li.appendChild(todoActions);
        li.appendChild(todoDetails);
        todosListElement.appendChild(li);
    });
}

// --- Event Handlers ---

function handleAddProject() {
    const projectName = newProjectInput.value.trim();
    if (projectName) {
        const newProject = appLogic.addProject(projectName);
        if (newProject) {
            appLogic.setCurrentProject(newProject.id);
            newProjectInput.value = ''; // Clear input
            renderProjects();
            renderCurrentProjectTodos();
        } else {
            alert(`Project "${projectName}" already exists.`);
        }
    } else {
        alert("Please enter a project name.");
    }
}

function handleDeleteProject() {
    const currentProject = appLogic.getCurrentProject();
    if (currentProject && currentProject.name !== 'Default') { // Prevent deleting Default project
        if (confirm(`Are you sure you want to delete the project "${currentProject.name}" and all its todos?`)) {
            const deleted = appLogic.deleteProject(currentProject.id);
            if (deleted) {
                renderProjects();
                renderCurrentProjectTodos(); // Will render the new current project or default
            }
        }
    } else if (currentProject.name === 'Default') {
        alert("The 'Default' project cannot be deleted.");
    }
}

function handleProjectSelection(event) {
    if (event.target.tagName === 'LI') {
        const projectId = event.target.dataset.projectId;
        if (projectId) {
            appLogic.setCurrentProject(projectId);
            renderProjects(); // Re-render to update active class
            renderCurrentProjectTodos();
        }
    }
}

function handleTodoActions(event) {
    const button = event.target.closest('button');
    if (!button) {
        // If the click wasn't on a button, maybe it was on the main todo area to expand/collapse
        const todoItem = event.target.closest('.todo-item');
        if (todoItem) {
             toggleTodoDetails(todoItem);
        }
        return;
    }
    
    const action = button.dataset.action;
    const todoItem = button.closest('.todo-item');
    const todoId = todoItem?.dataset.todoId;
    const projectId = todoItem?.dataset.projectId;

    if (!todoId || !projectId) return;

    switch (action) {
        case 'toggleComplete':
            appLogic.toggleTodoComplete(projectId, todoId);
            renderCurrentProjectTodos(); // Re-render to show completion status
            break;
        case 'edit':
            openEditTodoDialog(projectId, todoId);
            break;
        case 'delete':
            if (confirm('Are you sure you want to delete this todo?')) {
                appLogic.deleteTodoFromProject(projectId, todoId);
                renderCurrentProjectTodos(); // Re-render the list
            }
            break;
    }
}

function toggleTodoDetails(todoItemElement) {
    const detailsDiv = todoItemElement.querySelector('.todo-details');
    if (detailsDiv) {
        detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    }
}

function openAddTodoDialog() {
    todoForm.reset(); // Clear form
    dialogTitle.textContent = 'Add New Todo';
    // Set hidden project ID for the current project
    const currentProject = appLogic.getCurrentProject();
    if (currentProject) {
        todoForm.projectId.value = currentProject.id;
        todoForm.todoId.value = ''; // Ensure no todo ID is set for adding
        todoDialog.showModal();
    } else {
        alert("Please select a project before adding a todo.");
    }
}

function openEditTodoDialog(projectId, todoId) {
    const project = appLogic.getProjectById(projectId);
    const todo = project?.getTodoById(todoId);

    if (todo) {
        todoForm.reset();
        dialogTitle.textContent = 'Edit Todo';

        // Populate form
        todoForm.projectId.value = projectId;
        todoForm.todoId.value = todoId;
        todoForm.title.value = todo.title;
        todoForm.description.value = todo.description;
        // Format date for input type='date'
        if (todo.dueDate && isValid(todo.dueDate)) {
             todoForm.dueDate.value = format(todo.dueDate, 'yyyy-MM-dd');
        } else {
            todoForm.dueDate.value = '';
        }
        todoForm.priority.value = todo.priority;
        todoForm.notes.value = todo.notes;

        todoDialog.showModal();
    } else {
        alert("Could not find the todo to edit.");
    }
}

function handleSaveTodo(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(todoForm);
    const todoId = formData.get('todoId');
    const projectId = formData.get('projectId');
    const title = formData.get('title');
    const description = formData.get('description');
    const dueDateStr = formData.get('dueDate');
    const priority = formData.get('priority');
    const notes = formData.get('notes');

    // Basic validation
    if (!projectId || !title || !dueDateStr || !priority) {
        alert("Please fill in all required fields (Title, Due Date, Priority).");
        return;
    }
    
    // Parse date safely
    const dueDate = parseISO(dueDateStr);
     if (!isValid(dueDate)) {
        alert("Invalid date format entered.");
        return;
    }

    if (todoId) { // Editing existing todo
        const updatedProperties = {
            title,
            description,
            dueDate, // Already a Date object
            priority,
            notes
        };
        const success = appLogic.updateTodoInProject(projectId, todoId, updatedProperties);
        if (!success) {
            alert("Failed to update todo.");
        }
    } else { // Adding new todo
        const newTodo = appLogic.addTodoToProject(projectId, title, description, dueDate, priority, notes);
        if (!newTodo) {
             alert("Failed to add todo.");
        }
    }

    todoDialog.close(); // Close dialog after saving
    renderCurrentProjectTodos(); // Re-render the list to show changes
}

// --- Helper Functions (could be expanded) ---
// (Currently incorporated into render functions)
