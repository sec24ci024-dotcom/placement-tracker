import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "placementTracker";

const initialCategories = [
    {
        name: "DSA",
        tasks: [
            "Two Sum",
            "Binary Search",
            "Valid Parentheses",
            "Reverse Linked List",
            "Maximum Subarray"
        ]
    },
    {
        name: "Coding Practice",
        tasks: [
            "Arrays",
            "Strings",
            "HashMap",
            "Two Pointer",
            "Sliding Window"
        ]
    },
    {
        name: "Aptitude",
        tasks: [
            "Percentages",
            "Profit and Loss",
            "Time and Work",
            "Time Speed Distance",
            "Probability"
        ]
    },
    {
        name: "Courses",
        tasks: [
            "JavaScript Fundamentals",
            "React",
            "Node.js",
            "SQL",
            "AWS"
        ]
    },
    {
        name: "Projects",
        tasks: [
            "Placement Tracker",
            "GenAI Project",
            "IoT AI Cloud Project"
        ]
    },
    {
        name: "Interview Preparation",
        tasks: [
            "Tell me about yourself",
            "Explain my projects",
            "OOP Concepts",
            "DBMS Questions",
            "HR Questions"
        ]
    }
];

function App() {

    const [categories, setCategories] = useState(() => {

        const savedData =
            localStorage.getItem(STORAGE_KEY);

        if (savedData) {

            try {

                const data = JSON.parse(savedData);

                return data.categories ||
                    initialCategories;

            } catch {

                return initialCategories;

            }
        }

        return initialCategories;
    });

    const [completed, setCompleted] = useState(() => {

        const savedData =
            localStorage.getItem(STORAGE_KEY);

        if (savedData) {

            try {

                const data = JSON.parse(savedData);

                return data.completed || {};

            } catch {

                return {};

            }
        }

        return {};
    });

    const [newTask, setNewTask] = useState({});

    const [search, setSearch] = useState("");

    useEffect(() => {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                categories,
                completed
            })
        );

    }, [categories, completed]);

    function toggleTask(categoryName, taskName) {

        const key =
            `${categoryName}-${taskName}`;

        setCompleted(previous => ({
            ...previous,
            [key]: !previous[key]
        }));
    }

    function addTask(categoryName) {

        const task =
            newTask[categoryName]?.trim();

        if (!task) {
            return;
        }

        setCategories(previous =>
            previous.map(category => {

                if (
                    category.name !==
                    categoryName
                ) {
                    return category;
                }

                return {
                    ...category,

                    tasks: [
                        ...category.tasks,
                        task
                    ]
                };
            })
        );

        setNewTask(previous => ({
            ...previous,
            [categoryName]: ""
        }));
    }

    function deleteTask(
        categoryName,
        taskName
    ) {

        setCategories(previous =>
            previous.map(category => {

                if (
                    category.name !==
                    categoryName
                ) {
                    return category;
                }

                return {
                    ...category,

                    tasks:
                        category.tasks.filter(
                            task =>
                                task !== taskName
                        )
                };
            })
        );

        const key =
            `${categoryName}-${taskName}`;

        setCompleted(previous => {

            const updated = {
                ...previous
            };

            delete updated[key];

            return updated;
        });
    }

    let totalTasks = 0;

    let completedTasks = 0;

    categories.forEach(category => {

        totalTasks +=
            category.tasks.length;

        category.tasks.forEach(task => {

            const key =
                `${category.name}-${task}`;

            if (completed[key]) {
                completedTasks++;
            }
        });
    });

    const pendingTasks =
        totalTasks - completedTasks;

    const overallProgress =
        totalTasks === 0
            ? 0
            : (completedTasks /
                totalTasks) * 100;

    return (

        <div className="app">

            <header className="header">

                <h1>
                    Placement Preparation Tracker
                </h1>

                <p>
                    Track your progress and become
                    placement ready.
                </p>

            </header>

            <main>

                <section className="overall-progress">

                    <h2>
                        Overall Progress
                    </h2>

                    <p>
                        Completed:
                        {" "}
                        {completedTasks}
                        {" / "}
                        {totalTasks}
                    </p>

                    <div className="overall-progress-container">

                        <div
                            className="overall-progress-bar"
                            style={{
                                width:
                                    `${overallProgress}%`
                            }}
                        />

                    </div>

                    <p>
                        {overallProgress.toFixed(0)}%
                    </p>

                </section>

                <section className="statistics">

                    <div className="stat-card">

                        <span>
                            Total Tasks
                        </span>

                        <strong>
                            {totalTasks}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedTasks}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingTasks}
                        </strong>

                    </div>

                </section>

                <div className="search-container">

                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <h2 className="section-title">
                    Preparation Categories
                </h2>

                <section className="dashboard">

                    {categories.map(category => {

                        const filteredTasks =
                            category.tasks.filter(
                                task =>
                                    task
                                        .toLowerCase()
                                        .includes(
                                            search
                                                .toLowerCase()
                                        )
                            );

                        const categoryCompleted =
                            category.tasks.filter(
                                task =>
                                    completed[
                                        `${category.name}-${task}`
                                    ]
                            ).length;

                        const categoryTotal =
                            category.tasks.length;

                        const categoryProgress =
                            categoryTotal === 0
                                ? 0
                                : (
                                    categoryCompleted /
                                    categoryTotal
                                ) * 100;

                        return (

                            <div
                                className="category-card"
                                key={category.name}
                            >

                                <h2>
                                    {category.name}
                                </h2>

                                <p>
                                    Completed:
                                    {" "}
                                    {categoryCompleted}
                                    {" / "}
                                    {categoryTotal}
                                </p>

                                <div className="progress-container">

                                    <div
                                        className="progress-bar"
                                        style={{
                                            width:
                                                `${categoryProgress}%`
                                        }}
                                    />

                                </div>

                                <p className="percentage">
                                    {categoryProgress.toFixed(0)}%
                                </p>

                                <div className="add-task">

                                    <input
                                        type="text"
                                        placeholder="Enter a task"
                                        value={
                                            newTask[
                                                category.name
                                            ] || ""
                                        }
                                        onChange={event =>
                                            setNewTask(
                                                previous => ({
                                                    ...previous,

                                                    [category.name]:
                                                        event.target.value
                                                })
                                            )
                                        }
                                        onKeyDown={event => {

                                            if (
                                                event.key ===
                                                "Enter"
                                            ) {

                                                addTask(
                                                    category.name
                                                );

                                            }

                                        }}
                                    />

                                    <button
                                        onClick={() =>
                                            addTask(
                                                category.name
                                            )
                                        }
                                    >
                                        Add Task
                                    </button>

                                </div>

                                <div className="task-list">

                                    {filteredTasks.map(
                                        task => {

                                            const key =
                                                `${category.name}-${task}`;

                                            return (

                                                <div
                                                    className="task"
                                                    key={task}
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            !!completed[
                                                                key
                                                            ]
                                                        }
                                                        onChange={() =>
                                                            toggleTask(
                                                                category.name,
                                                                task
                                                            )
                                                        }
                                                    />

                                                    <span
                                                        className={
                                                            completed[
                                                                key
                                                            ]
                                                                ? "completed"
                                                                : ""
                                                        }
                                                    >
                                                        {task}
                                                    </span>

                                                    <button
                                                        className="delete"
                                                        onClick={() =>
                                                            deleteTask(
                                                                category.name,
                                                                task
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            );

                                        }
                                    )}

                                    {filteredTasks.length === 0 && (
                                        <p>
                                            No matching tasks.
                                        </p>
                                    )}

                                </div>

                            </div>

                        );

                    })}

                </section>

            </main>

        </div>
    );
}

export default App;