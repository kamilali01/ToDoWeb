# ToDo Web Application

A simple yet functional web-based ToDo list application built with vanilla JavaScript, HTML, and CSS, bundled using Webpack. Manage your tasks efficiently with project organization, due dates, priorities, and a dark/light theme toggle.

**Live Demo:** [https://kamilali01.github.io/ToDoWeb/](https://kamilali01.github.io/ToDoWeb/)

## Features

*   **Project Management:** Create multiple projects to organize your tasks.
*   **Task Management:** Add, edit, delete, and mark tasks as complete within projects.
*   **Task Details:** Assign titles, descriptions, due dates, and priorities (Low, Medium, High) to tasks.
*   **Persistence:** Your projects and tasks are saved in the browser's `localStorage`, so they persist across sessions.
*   **Theme Toggle:** Switch between light and dark themes for comfortable viewing. Your preference is saved.
*   **Responsive Design:** Basic responsiveness for usability on different screen sizes.
*   **Dynamic UI:** The user interface is built dynamically using JavaScript.

## Technologies Used

*   **Frontend:**
    *   HTML5
    *   CSS3 (with CSS Variables for theming)
    *   Vanilla JavaScript (ES6 Modules)
*   **Build Tool:**
    *   Webpack 5
    *   Webpack Dev Server (for local development)
*   **Libraries:**
    *   `date-fns` (for date formatting and manipulation)
*   **Deployment:**
    *   GitHub Pages
    *   `gh-pages` (npm package for deployment)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kamilali01/ToDoWeb.git
    cd ToDoWeb
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

### Running Locally

To run the application in development mode with hot reloading:

```bash
npm start
```

This will open the application in your default browser, typically at `http://localhost:8080`.

### Building for Production

To create an optimized build in the `dist` folder:

```bash
npm run build:prod
```

## Deployment

This project is configured for deployment to GitHub Pages.

1.  Ensure your repository is set up correctly on GitHub.
2.  Run the deployment script:
    ```bash
    npm run deploy
    ```
    This command will first build the project for production and then push the contents of the `dist` folder to the `gh-pages` branch.
3.  Configure your repository's GitHub Pages settings to deploy from the `gh-pages` branch.

