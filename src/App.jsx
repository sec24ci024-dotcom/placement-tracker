import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialCategories = [
  {
    id: 1,
    name: "DSA",
    target: 100,
    tasks: [
      { id: 101, name: "Two Sum", completed: true },
      { id: 102, name: "Binary Search", completed: true },
      { id: 103, name: "Valid Parentheses", completed: false },
      { id: 104, name: "Reverse Linked List", completed: false },
      { id: 105, name: "Maximum Subarray", completed: false },
    ],
  },
  {
    id: 2,
    name: "Coding Practice",
    target: 100,
    tasks: [
      { id: 201, name: "Arrays", completed: true },
      { id: 202, name: "Strings", completed: false },
      { id: 203, name: "HashMap", completed: false },
    ],
  },
  {
    id: 3,
    name: "Aptitude",
    target: 50,
    tasks: [
      { id: 301, name: "Profit and Loss", completed: false },
      { id: 302, name: "Time and Work", completed: false },
    ],
  },
  {
    id: 4,
    name: "Courses",
    target: 10,
    tasks: [
      { id: 401, name: "JavaScript Basics", completed: true },
      { id: 402, name: "React Fundamentals", completed: false },
    ],
  },
  {
    id: 5,
    name: "Projects",
    target: 3,
    tasks: [
      { id: 501, name: "Placement Tracker", completed: true },
      { id: 502, name: "AI Project", completed: false },
    ],
  },
  {
    id: 6,
    name: "Interview Preparation",
    target: 20,
    tasks: [
      { id: 601, name: "OOP Questions", completed: false },
      { id: 602, name: "DBMS Questions", completed: false },
    ],
  },
];

function App() {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("placementCategories");

    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newTasks, setNewTasks] = useState({});

  useEffect(() => {
  fetch("http://localhost:5000/api/tasks")
    .then((response) => response.json())
    .then((data) => {
      console.log("Tasks from backend:", data);
    })
    .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "placementCategories",
      JSON.stringify(categories)
    );
  }, [categories]);

  const totalTasks = categories.reduce(
    (total, category) => total + category.tasks.length,
    0
  );

  const completedTasks = categories.reduce(
    (total, category) =>
      total +
      category.tasks.filter((task) => task.completed).length,
    0
  );

  const pendingTasks = totalTasks - completedTasks;

  const overallProgress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const filteredCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      tasks: category.tasks.filter((task) => {
        const matchesSearch = task.name
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesFilter =
          filter === "all" ||
          (filter === "completed" && task.completed) ||
          (filter === "pending" && !task.completed);

        return matchesSearch && matchesFilter;
      }),
    }));
  }, [categories, search, filter]);

  const toggleTask = (categoryId, taskId) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              tasks: category.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : category
      )
    );
  };

  const deleteTask = (categoryId, taskId) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              tasks: category.tasks.filter(
                (task) => task.id !== taskId
              ),
            }
          : category
      )
    );
  };

  const handleTaskInput = (categoryId, value) => {
    setNewTasks((current) => ({
      ...current,
      [categoryId]: value,
    }));
  };

  const addTask = (categoryId) => {
    const taskName = newTasks[categoryId]?.trim();

    if (!taskName) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              tasks: [
                ...category.tasks,
                {
                  id: Date.now(),
                  name: taskName,
                  completed: false,
                },
              ],
            }
          : category
      )
    );

    setNewTasks((current) => ({
      ...current,
      [categoryId]: "",
    }));
  };

  const clearCompleted = () => {
    setCategories((current) =>
      current.map((category) => ({
        ...category,
        tasks: category.tasks.filter((task) => !task.completed),
      }))
    );
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">PLACEMENT PREPARATION</p>

          <h1>Placement Tracker</h1>

          <p>
            Track your coding, aptitude, courses, projects and
            interview preparation.
          </p>
        </div>

        <div className="header-progress">
          <strong>{overallProgress}%</strong>
          <span>Overall Progress</span>
        </div>
      </header>

      <main>
        <section className="overall-progress">
          <div className="section-heading">
            <div>
              <p className="small-label">YOUR PROGRESS</p>
              <h2>Overall Preparation</h2>
            </div>

            <span className="progress-percentage">
              {overallProgress}%
            </span>
          </div>

          <div className="overall-progress-container">
            <div
              className="overall-progress-bar"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <p className="progress-message">
            {overallProgress === 100
              ? "Excellent! You are fully prepared."
              : overallProgress >= 70
              ? "Great progress! Keep pushing."
              : overallProgress >= 40
              ? "Good start. Stay consistent."
              : "Start completing tasks to build momentum."}
          </p>
        </section>

        <section className="statistics">
          <div className="stat-card">
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
            <small>All categories</small>
          </div>

          <div className="stat-card success-card">
            <span>Completed</span>
            <strong>{completedTasks}</strong>
            <small>Tasks finished</small>
          </div>

          <div className="stat-card warning-card">
            <span>Pending</span>
            <strong>{pendingTasks}</strong>
            <small>Tasks remaining</small>
          </div>
        </section>

        <section className="controls">
          <div className="search-container">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={filter === "pending" ? "active" : ""}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>

            <button
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>

          <button className="clear-button" onClick={clearCompleted}>
            Clear Completed
          </button>
        </section>

        <div className="section-title-row">
          <div>
            <p className="small-label">PREPARATION AREAS</p>
            <h2 className="section-title">Your Categories</h2>
          </div>

          <span className="category-count">
            {categories.length} Categories
          </span>
        </div>

        <section className="dashboard">
          {filteredCategories.map((category) => {
            const actualCompleted = category.tasks.filter(
              (task) => task.completed
            ).length;

            const allTasks =
              categories.find((item) => item.id === category.id)
                ?.tasks || [];

            const completedCount = allTasks.filter(
              (task) => task.completed
            ).length;

            const progress =
              category.target > 0
                ? Math.min(
                    100,
                    Math.round(
                      (completedCount / category.target) * 100
                    )
                  )
                : 0;

            return (
              <div className="category-card" key={category.id}>
                <div className="category-header">
                  <div>
                    <h2>{category.name}</h2>

                    <p>
                      {completedCount} completed / {category.target} target
                    </p>
                  </div>

                  <div className="category-icon">
                    {category.name.charAt(0)}
                  </div>
                </div>

                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="category-progress">
                  <span>{progress}% complete</span>
                  <span>
                    {completedCount}/{category.target}
                  </span>
                </div>

                <div className="add-task">
                  <input
                    type="text"
                    placeholder={`Add ${category.name} task...`}
                    value={newTasks[category.id] || ""}
                    onChange={(e) =>
                      handleTaskInput(category.id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addTask(category.id);
                      }
                    }}
                  />

                  <button
                    onClick={() => addTask(category.id)}
                  >
                    +
                  </button>
                </div>

                <div className="task-list">
                  {category.tasks.length === 0 ? (
                    <div className="empty-state">
                      No tasks found.
                    </div>
                  ) : (
                    category.tasks.map((task) => (
                      <div className="task" key={task.id}>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() =>
                            toggleTask(category.id, task.id)
                          }
                        />

                        <span
                          className={
                            task.completed ? "completed" : ""
                          }
                        >
                          {task.name}
                        </span>

                        <button
                          className="delete"
                          onClick={() =>
                            deleteTask(category.id, task.id)
                          }
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {search || filter !== "all" ? (
                  <p className="filtered-info">
                    Showing {actualCompleted} completed task
                    {actualCompleted !== 1 ? "s" : ""}.
                  </p>
                ) : null}
              </div>
            );
          })}
        </section>
      </main>

      <footer>
        <p>Placement Tracker • Keep learning. Keep building. 🚀</p>
      </footer>
    </div>
  );
}

export default App;