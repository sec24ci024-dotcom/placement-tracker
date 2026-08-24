import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialCategories = [
  {
    id: 1,
    name: "DSA",
    icon: "💻",
    target: 100,
    tasks: [
      { id: 1, name: "Two Sum", completed: true },
      { id: 2, name: "Binary Search", completed: true },
      { id: 3, name: "Valid Parentheses", completed: false },
      { id: 4, name: "Reverse Linked List", completed: false },
      { id: 5, name: "Maximum Subarray", completed: false },
    ],
  },
  {
    id: 2,
    name: "Coding Practice",
    icon: "⌨️",
    target: 100,
    tasks: [
      { id: 6, name: "Arrays", completed: true },
      { id: 7, name: "Strings", completed: false },
      { id: 8, name: "HashMap", completed: false },
    ],
  },
  {
    id: 3,
    name: "Aptitude",
    icon: "🧠",
    target: 50,
    tasks: [
      { id: 9, name: "Profit and Loss", completed: false },
      { id: 10, name: "Time and Work", completed: false },
      { id: 11, name: "Height and Distance", completed: false },
    ],
  },
  {
    id: 4,
    name: "Courses",
    icon: "📚",
    target: 10,
    tasks: [
      { id: 12, name: "JavaScript Course", completed: true },
      { id: 13, name: "React Course", completed: false },
    ],
  },
  {
    id: 5,
    name: "Projects",
    icon: "🚀",
    target: 3,
    tasks: [
      { id: 14, name: "Placement Tracker", completed: true },
      { id: 15, name: "AI Project", completed: false },
    ],
  },
  {
    id: 6,
    name: "Interview Preparation",
    icon: "🎯",
    target: 20,
    tasks: [
      { id: 16, name: "OOP Questions", completed: false },
      { id: 17, name: "DBMS Questions", completed: false },
      { id: 18, name: "HR Questions", completed: false },
    ],
  },
];

function App() {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("placementCategories");

    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("placementDarkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "placementCategories",
      JSON.stringify(categories)
    );
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(
      "placementDarkMode",
      darkMode
    );
  }, [darkMode]);

  const allTasks = useMemo(() => {
    return categories.flatMap((category) => category.tasks);
  }, [categories]);

  const totalTasks = allTasks.length;

  const completedTasks = allTasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const overallProgress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const level =
    overallProgress >= 90
      ? "Placement Ready"
      : overallProgress >= 75
      ? "Advanced"
      : overallProgress >= 50
      ? "Intermediate"
      : overallProgress >= 25
      ? "Getting Started"
      : "Beginner";

  const badge =
    overallProgress >= 90
      ? "🏆"
      : overallProgress >= 75
      ? "🔥"
      : overallProgress >= 50
      ? "⭐"
      : "🌱";

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const toggleTask = (categoryId, taskId) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        return {
          ...category,
          tasks: category.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: !task.completed,
                }
              : task
          ),
        };
      })
    );
  };

  const addTask = (categoryId, taskName) => {
    if (!taskName.trim()) {
      return;
    }

    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        return {
          ...category,
          tasks: [
            ...category.tasks,
            {
              id: Date.now(),
              name: taskName.trim(),
              completed: false,
            },
          ],
        };
      })
    );
  };

  const deleteTask = (categoryId, taskId) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        return {
          ...category,
          tasks: category.tasks.filter(
            (task) => task.id !== taskId
          ),
        };
      })
    );
  };

  const resetProgress = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all progress?"
    );

    if (!confirmed) {
      return;
    }

    setCategories(initialCategories);
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="header">
        <div className="header-content">
          <div>
            <div className="brand">
              <span className="brand-icon">🚀</span>

              <div>
                <h1>Placement Tracker</h1>
                <p>Build skills. Track progress. Get placed.</p>
              </div>
            </div>

            <div className="date">
              📅 {today}
            </div>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <main>
        <section className="welcome">
          <div>
            <span className="welcome-label">
              YOUR PLACEMENT JOURNEY
            </span>

            <h2>
              Keep pushing,
              <span> you are getting closer! 💪</span>
            </h2>

            <p>
              Stay consistent and complete your preparation
              tasks every day.
            </p>
          </div>

          <div className="level-card">
            <div className="level-badge">
              {badge}
            </div>

            <div>
              <small>Current Level</small>
              <strong>{level}</strong>
            </div>
          </div>
        </section>

        <section className="overall-progress">
          <div className="progress-heading">
            <div>
              <span className="small-label">
                OVERALL PROGRESS
              </span>

              <h2>{overallProgress}%</h2>
            </div>

            <div className="progress-info">
              <strong>
                {completedTasks}/{totalTasks}
              </strong>
              <span>tasks completed</span>
            </div>
          </div>

          <div className="overall-progress-container">
            <div
              className="overall-progress-bar"
              style={{
                width: `${overallProgress}%`,
              }}
            ></div>
          </div>

          <div className="progress-footer">
            <span>
              {overallProgress === 100
                ? "🎉 All tasks completed!"
                : `${pendingTasks} tasks remaining`}
            </span>

            <span>
              {overallProgress}% complete
            </span>
          </div>
        </section>

        <section className="statistics">
          <div className="stat-card">
            <div className="stat-icon blue">
              📋
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{totalTasks}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ✅
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              ⏳
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              📂
            </div>

            <div>
              <span>Categories</span>
              <strong>{categories.length}</strong>
            </div>
          </div>
        </section>

        <section className="achievement">
          <div className="achievement-icon">
            {badge}
          </div>

          <div className="achievement-content">
            <span>ACHIEVEMENT STATUS</span>

            <h3>
              {overallProgress >= 75
                ? "Excellent progress! 🔥"
                : overallProgress >= 50
                ? "You're halfway there! 🚀"
                : "Your journey has started! 🌱"}
            </h3>

            <p>
              {overallProgress >= 75
                ? "Keep this momentum going and finish strong."
                : "Complete more tasks to unlock higher levels."}
            </p>
          </div>

          <div className="streak">
            <strong>🔥 1</strong>
            <span>Day Streak</span>
          </div>
        </section>

        <section className="search-section">
          <div className="section-heading">
            <div>
              <span className="small-label">
                PREPARATION PLAN
              </span>

              <h2>Your Tasks</h2>
            </div>

            <button
              className="reset-button"
              onClick={resetProgress}
            >
              Reset Progress
            </button>
          </div>

          <div className="search-container">
            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
        </section>

        <section className="dashboard">
          {categories.map((category) => {
            const completed = category.tasks.filter(
              (task) => task.completed
            ).length;

            const total = category.tasks.length;

            const progress =
              total === 0
                ? 0
                : Math.round(
                    (completed / total) * 100
                  );

            const filteredTasks =
              category.tasks.filter((task) =>
                task.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              );

            return (
              <div
                className="category-card"
                key={category.id}
              >
                <div className="category-header">
                  <div className="category-title">
                    <div className="category-icon">
                      {category.icon}
                    </div>

                    <div>
                      <h2>{category.name}</h2>

                      <p>
                        {completed} of {total} completed
                      </p>
                    </div>
                  </div>

                  <div className="category-percentage">
                    {progress}%
                  </div>
                </div>

                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>
                </div>

                <AddTask
                  onAdd={(taskName) =>
                    addTask(
                      category.id,
                      taskName
                    )
                  }
                />

                <div className="task-list">
                  {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                      <span>🔎</span>
                      <p>No matching tasks</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        className={
                          task.completed
                            ? "task completed"
                            : "task"
                        }
                        key={task.id}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() =>
                            toggleTask(
                              category.id,
                              task.id
                            )
                          }
                        />

                        <span>{task.name}</span>

                        <button
                          className="delete"
                          onClick={() =>
                            deleteTask(
                              category.id,
                              task.id
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      <footer>
        <p>
          Placement Tracker • Keep learning. Keep building.
          Keep growing. 🚀
        </p>
      </footer>
    </div>
  );
}

function AddTask({ onAdd }) {
  const [taskName, setTaskName] = useState("");

  const handleSubmit = () => {
    if (!taskName.trim()) {
      return;
    }

    onAdd(taskName);
    setTaskName("");
  };

  return (
    <div className="add-task">
      <input
        type="text"
        placeholder="Add a new task..."
        value={taskName}
        onChange={(e) =>
          setTaskName(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
      />

      <button onClick={handleSubmit}>
        + Add
      </button>
    </div>
  );
}

export default App;