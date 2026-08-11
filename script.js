const dashboard = document.getElementById("dashboard");

const categories = [
    {
        name: "DSA",
        completed: 0,
        target: 100
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

categories.forEach((category) => {

    const card = document.createElement("div");
    card.classList.add("category-card");

    const progress = (category.completed / category.target) * 100;

    card.innerHTML = `
        <h2>${category.name}</h2>

        <p>
            Completed: ${category.completed} / ${category.target}
        </p>

        <div class="progress-container">
            <div class="progress-bar"></div>
        </div>

        <p>${progress.toFixed(0)}%</p>
    `;

    const progressBar = card.querySelector(".progress-bar");

    progressBar.style.width = `${progress}%`;

    dashboard.appendChild(card);
});