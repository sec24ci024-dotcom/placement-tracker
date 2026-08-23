function CategoryCard({
    category,
    completed,
    newTask,
    setNewTask,
    addTask,
    toggleTask,
    deleteTask
}) {

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
            : (categoryCompleted / categoryTotal) * 100;

    return (
        <div className="category-card">

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
                        newTask[category.name] || ""
                    }
                    onChange={event =>
                        setNewTask({
                            ...newTask,
                            [category.name]:
                                event.target.value
                        })
                    }
                    onKeyDown={event => {

                        if (event.key === "Enter") {
                            addTask(category.name);
                        }

                    }}
                />

                <button
                    onClick={() =>
                        addTask(category.name)
                    }
                >
                    Add Task
                </button>

            </div>

            <div className="task-list">

                {category.tasks.map(task => {

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
                                    !!completed[key]
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
                                    completed[key]
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

                })}

            </div>

        </div>
    );
}

export default CategoryCard;