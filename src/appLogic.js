import Project from './project.js';
import Todo from './todo.js';

const LOCAL_STORAGE_KEY = 'todoAppData';

let projects = [];
let currentProjectId = null;

// --- Data Persistence (localStorage) ---

function saveData() {
    const dataToSave = {
        projects: projects.map(project => project.toPlainObject()),
        currentProjectId: currentProjectId,
    };
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("Data saved to localStorage.");
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
    }
}

function loadData() {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            const parsedData = JSON.parse(data);
            // Important: Re-hydrate Project and Todo instances
            projects = parsedData.projects.map(projectObj => Project.fromPlainObject(projectObj));
            currentProjectId = parsedData.currentProjectId;
            console.log("Data loaded from localStorage.");

            // Ensure a default project exists if loading results in none
            if (projects.length === 0) {
                createDefaultProject();
            } else if (currentProjectId === null || !getProjectById(currentProjectId)) {
                // If currentProjectId is invalid, default to the first project
                currentProjectId = projects[0]?.id || null; 
                if (currentProjectId === null) { // Should not happen if projects.length > 0, but safe check
                     createDefaultProject();
                }
            }
        } else {
            console.log("No data found in localStorage, initializing default project.");
            createDefaultProject();
        }
    } catch (error) {
        console.error("Error loading data from localStorage:", error);
        // If loading fails, start with a default project
        projects = []; // Clear potentially corrupted data
        createDefaultProject();
    }
    // If after all loading/error handling, there's still no current project, set it.
    if (currentProjectId === null && projects.length > 0) {
         currentProjectId = projects[0].id;
    }
}

function createDefaultProject() {
    if (!projects.some(p => p.name === 'Default')) {
        const defaultProject = new Project('Default');
        projects.push(defaultProject);
        currentProjectId = defaultProject.id; // Set the new default project as current
        saveData(); // Save immediately after creating default
    }
}

// --- Project Management ---

function addProject(name) {
    if (projects.some(p => p.name === name)) {
        console.warn(`Project with name "${name}" already exists.`);
        return null; // Indicate failure or existing project
    }
    const newProject = new Project(name);
    projects.push(newProject);
    saveData();
    return newProject; // Return the created project
}

function deleteProject(projectId) {
    const initialLength = projects.length;
    projects = projects.filter(project => project.id !== projectId);
    if (projects.length < initialLength) {
        // If the deleted project was the current one, select a new current project
        if (currentProjectId === projectId) {
            currentProjectId = projects[0]?.id || null;
            if (projects.length === 0) { // If no projects left, create default
                createDefaultProject();
            }
        }
        saveData();
        return true; // Indicate success
    }
    return false; // Indicate project not found
}

function renameProject(projectId, newName) {
    const project = getProjectById(projectId);
    if (project) {
        if (projects.some(p => p.name === newName && p.id !== projectId)) {
            console.warn(`Another project with name "${newName}" already exists.`);
            return false; // Indicate failure due to name conflict
        }
        project.setName(newName);
        saveData();
        return true;
    }
    return false;
}

function getAllProjects() {
    return [...projects]; // Return a copy
}

function getProjectById(projectId) {
    return projects.find(project => project.id === projectId);
}

function getCurrentProject() {
    return getProjectById(currentProjectId);
}

function setCurrentProject(projectId) {
    if (getProjectById(projectId)) {
        currentProjectId = projectId;
        saveData(); // Save the change in current project
        return true;
    }
    return false;
}

// --- Todo Management ---

function addTodoToProject(projectId, title, description, dueDate, priority, notes, checklist) {
    const project = getProjectById(projectId);
    if (project) {
        const newTodo = new Todo(title, description, dueDate, priority, notes, checklist);
        project.addTodo(newTodo);
        saveData();
        return newTodo;
    }
    console.error(`Project with ID ${projectId} not found.`);
    return null;
}

function deleteTodoFromProject(projectId, todoId) {
    const project = getProjectById(projectId);
    if (project) {
        const initialTodoCount = project.getAllTodos().length;
        project.removeTodoById(todoId);
        if (project.getAllTodos().length < initialTodoCount) {
            saveData();
            return true; // Indicate success
        }
    }
    return false; // Indicate failure (project or todo not found)
}

function updateTodoInProject(projectId, todoId, updatedProperties) {
    const project = getProjectById(projectId);
    const todo = project?.getTodoById(todoId);

    if (todo) {
        // Update only provided properties
        if (updatedProperties.hasOwnProperty('title')) todo.setTitle(updatedProperties.title);
        if (updatedProperties.hasOwnProperty('description')) todo.setDescription(updatedProperties.description);
        if (updatedProperties.hasOwnProperty('dueDate')) todo.setDueDate(updatedProperties.dueDate);
        if (updatedProperties.hasOwnProperty('priority')) todo.setPriority(updatedProperties.priority);
        if (updatedProperties.hasOwnProperty('notes')) todo.setNotes(updatedProperties.notes);
        // Checklist updates might need more specific functions (add/remove/toggle item)
        if (updatedProperties.hasOwnProperty('completed')) todo.toggleComplete(); // Or set based on value

        saveData();
        return true;
    }
    return false;
}

function toggleTodoComplete(projectId, todoId) {
    const project = getProjectById(projectId);
    const todo = project?.getTodoById(todoId);
    if (todo) {
        todo.toggleComplete();
        saveData();
        return true;
    }
    return false;
}

// --- Initialization ---

// Load data when the module is first imported/run
loadData();

// Export the public API for the application logic
export {
    addProject,
    deleteProject,
    renameProject,
    getAllProjects,
    getProjectById,
    getCurrentProject,
    setCurrentProject,
    addTodoToProject,
    deleteTodoFromProject,
    updateTodoInProject,
    toggleTodoComplete,
    loadData, // Potentially expose for manual reload?
    saveData // Potentially expose for explicit save?
};
