import './style.css';
import { initializeUI } from './ui.js';
// Import appLogic to ensure data is loaded and default project exists
import * as appLogic from './appLogic.js'; 

console.log("ToDo App Initializing...");

// Wait for the DOM to be fully loaded before initializing UI
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    // Initialize the UI, which also loads data via appLogic import
    initializeUI(); 
});
