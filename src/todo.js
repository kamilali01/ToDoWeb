import { v4 as uuidv4 } from 'uuid'; // We'll install uuid later
import { parseISO } from 'date-fns';

export default class Todo {
    constructor(title, description, dueDate, priority, notes = '', checklist = [], completed = false, id = uuidv4()) {
        this.id = id; // Unique ID for each todo
        this.title = title;
        this.description = description;
        // Ensure dueDate is a Date object, even when loading from JSON
        this.dueDate = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
        this.priority = priority; // e.g., 'low', 'medium', 'high'
        this.notes = notes;
        this.checklist = checklist; // Array of { item: string, completed: boolean }
        this.completed = completed;
    }

    // Methods to modify properties
    setTitle(newTitle) {
        this.title = newTitle;
    }

    setDescription(newDescription) {
        this.description = newDescription;
    }

    setDueDate(newDueDate) {
        this.dueDate = typeof newDueDate === 'string' ? parseISO(newDueDate) : newDueDate;
    }

    setPriority(newPriority) {
        this.priority = newPriority;
    }

    setNotes(newNotes) {
        this.notes = newNotes;
    }

    addChecklistItem(itemText) {
        this.checklist.push({ item: itemText, completed: false });
    }

    toggleChecklistItem(index) {
        if (this.checklist[index]) {
            this.checklist[index].completed = !this.checklist[index].completed;
        }
    }

    removeChecklistItem(index) {
        this.checklist.splice(index, 1);
    }

    toggleComplete() {
        this.completed = !this.completed;
    }

    // Method to get a simple object representation (useful for saving)
    toPlainObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            dueDate: this.dueDate.toISOString(), // Store as ISO string
            priority: this.priority,
            notes: this.notes,
            checklist: this.checklist,
            completed: this.completed,
        };
    }

    // Static method to create a Todo instance from a plain object (useful for loading)
    static fromPlainObject(obj) {
        return new Todo(
            obj.title,
            obj.description,
            obj.dueDate, // Already an ISO string, constructor handles parsing
            obj.priority,
            obj.notes,
            obj.checklist,
            obj.completed,
            obj.id
        );
    }
}
