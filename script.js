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
        target: 100
    },
    {
        name: "Aptitude",
        completed: 0,
        target: 50
    },
    {
        name: "Courses",
        completed: 0,
        target: 10
    },
    {
        name: "Projects",
        completed: 0,
        target: 3
    },
    {
        name: "Interview Preparation",
        completed: 0,
        target: 20
    }
];

let categories = JSON.parse(
    localStorage.getItem("placementCategories")
) || defaultCategories;

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
    `;

    const progressBar =
        card.querySelector(".progress-bar");

    const progressText =
        card.querySelector(".progress-text");

    const completionText =
        card.querySelector(".completion-text");

    function updateProgress() {

        const completedTasks = category.tasks
            ? category.tasks.filter(
                task => task.completed
            ).length
            : 0;

        category.completed = completedTasks;

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

    const taskList = document.createElement("div");
    taskList.classList.add("task-list");

    (category.tasks || []).forEach((task) => {

        const taskElement =
            document.createElement("label");

        taskElement.classList.add("task");

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const taskText =
            document.createElement("span");

        taskText.textContent = task.title;

        checkbox.addEventListener("change", () => {

            task.completed =
                checkbox.checked;

            updateProgress();
        });

        taskElement.appendChild(checkbox);
        taskElement.appendChild(taskText);

        taskList.appendChild(taskElement);
    });

    card.appendChild(taskList);

    updateProgress();

    dashboard.appendChild(card);
});