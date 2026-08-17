const dashboard = document.getElementById("dashboard");

const overallProgressBar =
    document.getElementById("overall-progress-bar");

const overallProgressText =
    document.getElementById("overall-progress-text");

const overallCompletion =
    document.getElementById("overall-completion");

const totalTasksElement =
    document.getElementById("total-tasks");

const completedTasksElement =
    document.getElementById("completed-tasks");

const pendingTasksElement =
    document.getElementById("pending-tasks");

const defaultCategories = [
    {
        name: "DSA",
        tasks: [
            {
                title: "Two Sum",
                completed: false
            },
            {
                title: "Binary Search",
                completed: false
            },
            {
                title: "Valid Parentheses",
                completed: false
            },
            {
                title: "Reverse Linked List",
                completed: false
            },
            {
                title: "Maximum Subarray",
                completed: false
            }
        ]
    },
    {
        name: "Coding Practice",
        tasks: [
            {
                title: "Arrays",
                completed: false
            },
            {
                title: "Strings",
                completed: false
            },
            {
                title: "HashMap",
                completed: false
            },
            {
                title: "Two Pointer",
                completed: false
            },
            {
                title: "Sliding Window",
                completed: false
            }
        ]
    },
    {
        name: "Aptitude",
        tasks: [
            {
                title: "Percentages",
                completed: false
            },
            {
                title: "Profit and Loss",
                completed: false
            },
            {
                title: "Time and Work",
                completed: false
            },
            {
                title: "Time Speed Distance",
                completed: false
            },
            {
                title: "Probability",
                completed: false
            }
        ]
    },
    {
        name: "Courses",
        tasks: [
            {
                title: "JavaScript Fundamentals",
                completed: false
            },
            {
                title: "React",
                completed: false
            },
            {
                title: "Node.js",
                completed: false
            },
            {
                title: "SQL",
                completed: false
            },
            {
                title: "AWS",
                completed: false
            }
        ]
    },
    {
        name: "Projects",
        tasks: [
            {
                title: "Placement Tracker",
                completed: false
            },
            {
                title: "GenAI Project",
                completed: false
            },
            {
                title: "IoT AI Cloud Project",
                completed: false
            }
        ]
    },
    {
        name: "Interview Preparation",
        tasks: [
            {
                title: "Tell me about yourself",
                completed: false
            },
            {
                title: "Explain my projects",
                completed: false
            },
            {
                title: "OOP Concepts",
                completed: false
            },
            {
                title: "DBMS Questions",
                completed: false
            },
            {
                title: "HR Questions",
                completed: false
            }
        ]
    }
];

let categories =
    JSON.parse(
        localStorage.getItem("placementCategories")
    ) || defaultCategories;

function updateOverallProgress() {

    let totalCompleted = 0;
    let totalTasks = 0;

    categories.forEach((category) => {

        totalCompleted += category.tasks.filter(
            task => task.completed
        ).length;

        totalTasks += category.tasks.length;

    });

    const progress =
        totalTasks === 0
            ? 0
            : (totalCompleted / totalTasks) * 100;

    overallProgressBar.style.width =
        `${progress}%`;

    overallProgressText.textContent =
        `${progress.toFixed(0)}%`;

    overallCompletion.textContent =
        `Completed: ${totalCompleted} / ${totalTasks}`;
}

function updateStatistics() {

    let totalTasks = 0;
    let completedTasks = 0;

    categories.forEach((category) => {

        totalTasks += category.tasks.length;

        completedTasks += category.tasks.filter(
            task => task.completed
        ).length;

    });

    const pendingTasks =
        totalTasks - completedTasks;

    totalTasksElement.textContent =
        totalTasks;

    completedTasksElement.textContent =
        completedTasks;

    pendingTasksElement.textContent =
        pendingTasks;
}

categories.forEach((category) => {

    const card =
        document.createElement("div");

    card.classList.add("category-card");

    card.innerHTML = `
        <h2>${category.name}</h2>

        <p class="completion-text">
            Completed: 0 / 0
        </p>

        <div class="progress-container">
            <div class="progress-bar"></div>
        </div>

        <p class="progress-text">0%</p>

        <div class="add-task">

            <input
                type="text"
                class="task-input"
                placeholder="Enter a task"
            >

            <button class="add-task-button">
                Add Task
            </button>

        </div>
    `;

    const progressBar =
        card.querySelector(".progress-bar");

    const progressText =
        card.querySelector(".progress-text");

    const completionText =
        card.querySelector(".completion-text");

    const taskInput =
        card.querySelector(".task-input");

    const addTaskButton =
        card.querySelector(".add-task-button");

    const taskList =
        document.createElement("div");

    taskList.classList.add("task-list");

    function updateProgress() {

        const completedTasks =
            category.tasks.filter(
                task => task.completed
            ).length;

        const totalTasks =
            category.tasks.length;

        const progress =
            totalTasks === 0
                ? 0
                : (completedTasks / totalTasks) * 100;

        progressBar.style.width =
            `${progress}%`;

        progressText.textContent =
            `${progress.toFixed(0)}%`;

        completionText.textContent =
            `Completed: ${completedTasks} / ${totalTasks}`;

        localStorage.setItem(
            "placementCategories",
            JSON.stringify(categories)
        );

        updateOverallProgress();
        updateStatistics();
    }

    function renderTasks() {

        taskList.innerHTML = "";

        category.tasks.forEach((task) => {

            const taskElement =
                document.createElement("div");

            taskElement.classList.add("task");

            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.checked =
                task.completed;

            const taskText =
                document.createElement("span");

            taskText.textContent =
                task.title;

            const editButton =
                document.createElement("button");

            editButton.textContent =
                "Edit";

            editButton.classList.add(
                "edit-button"
            );

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                "Delete";

            deleteButton.classList.add(
                "delete-button"
            );

            checkbox.addEventListener(
                "change",
                () => {

                    task.completed =
                        checkbox.checked;

                    updateProgress();

                    renderTasks();
                }
            );

            editButton.addEventListener(
                "click",
                () => {

                    const newTitle =
                        prompt(
                            "Enter new task name",
                            task.title
                        );

                    if (
                        newTitle !== null &&
                        newTitle.trim() !== ""
                    ) {

                        task.title =
                            newTitle.trim();

                        renderTasks();

                        updateProgress();
                    }
                }
            );

            deleteButton.addEventListener(
                "click",
                () => {

                    const index =
                        category.tasks.indexOf(task);

                    category.tasks.splice(
                        index,
                        1
                    );

                    renderTasks();

                    updateProgress();
                }
            );

            taskElement.appendChild(
                checkbox
            );

            taskElement.appendChild(
                taskText
            );

            taskElement.appendChild(
                editButton
            );

            taskElement.appendChild(
                deleteButton
            );

            taskList.appendChild(
                taskElement
            );
        });
    }

    addTaskButton.addEventListener(
        "click",
        () => {

            const title =
                taskInput.value.trim();

            if (title === "") {
                return;
            }

            category.tasks.push({
                title: title,
                completed: false
            });

            taskInput.value = "";

            renderTasks();

            updateProgress();
        }
    );

    taskInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                addTaskButton.click();
            }
        }
    );

    card.appendChild(taskList);

    renderTasks();

    updateProgress();

    dashboard.appendChild(card);
});

updateOverallProgress();
updateStatistics();