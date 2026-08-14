const dashboard = document.getElementById("dashboard");

const defaultCategories = [
    {
        name: "DSA",
        completed: 0,
        target: 100,
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
                title: "Sliding Window",
                completed: false
            }
        ]
    },
    {
        name: "Coding Practice",
        completed: 0,
        target: 100,
        tasks: []
    },
    {
        name: "Aptitude",
        completed: 0,
        target: 50,
        tasks: []
    },
    {
        name: "Courses",
        completed: 0,
        target: 10,
        tasks: []
    },
    {
        name: "Projects",
        completed: 0,
        target: 3,
        tasks: []
    },
    {
        name: "Interview Preparation",
        completed: 0,
        target: 20,
        tasks: []
    }
];

let categories =
    JSON.parse(localStorage.getItem("placementCategories")) ||
    defaultCategories;

categories.forEach((category) => {

    const card = document.createElement("div");
    card.classList.add("category-card");

    card.innerHTML = `
        <h2>${category.name}</h2>

        <p class="completion-text">
            Completed: ${category.completed} / ${category.target}
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

        category.completed =
            completedTasks;

        const progress =
            (category.completed / category.target) * 100;

        progressBar.style.width =
            `${progress}%`;

        progressText.textContent =
            `${progress.toFixed(0)}%`;

        completionText.textContent =
            `Completed: ${category.completed} / ${category.target}`;

        localStorage.setItem(
            "placementCategories",
            JSON.stringify(categories)
        );
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
            checkbox.checked = task.completed;

            const taskText =
                document.createElement("span");

            taskText.textContent =
                task.title;

            const editButton =
                document.createElement("button");

            editButton.textContent = "Edit";
            editButton.classList.add("edit-button");

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-button");

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

            const newTask = {
                title: title,
                completed: false
            };

            category.tasks.push(newTask);

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