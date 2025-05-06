import Todo from './todo.js';
import { v4 as uuidv4 } from 'uuid';

export default class Project {
    constructor(name, id = uuidv4()) {
        this.id = id; // Unique ID for each project
        this.name = name;
        this.todos = []; // Array to hold Todo objects
    }

    setName(newName) {
        this.name = newName;
    }

    addTodo(todo) {
        if (todo instanceof Todo) {
            // Ensure we don't add duplicates by ID
            if (!this.todos.some(t => t.id === todo.id)) {
                this.todos.push(todo);
            } else {
                console.warn(`Todo with ID ${todo.id} already exists in project ${this.name}.`);
            }
        } else {
            console.error("Invalid argument: Must be an instance of Todo.");
        }
    }

    removeTodoById(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
    }

    getTodoById(todoId) {
        return this.todos.find(todo => todo.id === todoId);
    }

    getAllTodos() {
        return [...this.todos]; // Return a copy to prevent direct modification
    }

    // Method to get a simple object representation
    toPlainObject() {
        return {
            id: this.id,
            name: this.name,
            // Convert each Todo to its plain object representation
            todos: this.todos.map(todo => todo.toPlainObject()),
        };
    }

    // Static method to create a Project instance from a plain object
    static fromPlainObject(obj) {
        const project = new Project(obj.name, obj.id);
        // Convert plain todo objects back into Todo instances
        project.todos = obj.todos.map(todoObj => Todo.fromPlainObject(todoObj));
        return project;
    }
}
