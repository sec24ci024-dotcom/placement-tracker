import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Auth from "./Auth";

const API_URL = "http://localhost:5000/api/tasks";

const initialCategories = [
  {
    id: 1,
    name: "DSA",
    target: 100,
    tasks: [],
  },
  {
    id: 2,
    name: "Coding Practice",
    target: 100,
    tasks: [],
  },
  {
    id: 3,
    name: "Aptitude",
    target: 50,
    tasks: [],
  },
  {
    id: 4,
    name: "Courses",
    target: 10,
    tasks: [],
  },
  {
    id: 5,
    name: "Projects",
    target: 3,
    tasks: [],
  },
  {
    id: 6,
    name: "Interview Preparation",
    target: 20,
    tasks: [],
  },
];

function App() {
  const [categories, setCategories] = useState(
    initialCategories
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newTasks, setNewTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Get JWT token
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Headers for protected API requests
  const getAuthHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Load tasks
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Session expired. Please login again.");
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error("SESSION_EXPIRED");
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch tasks"
          );
        }

        return data;
      })
      .then((tasks) => {
        setCategories((currentCategories) =>
          currentCategories.map((category) => ({
            ...category,

            tasks: tasks
              .filter(
                (task) =>
                  task.category === category.name
              )
              .map((task) => ({
                id: task._id || task.id,
                name: task.name,
                completed: task.completed,
              })),
          }))
        );

        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Load tasks error:",
          error
        );

        if (
          error.message ===
          "SESSION_EXPIRED"
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setUser(null);
          setCategories(initialCategories);

          setError(
            "Your session has expired. Please login again."
          );
        } else {
          setError(
            "Unable to connect to backend."
          );
        }

        setLoading(false);
      });
  }, [user]);

  // Statistics
  const totalTasks = categories.reduce(
    (total, category) =>
      total + category.tasks.length,
    0
  );

  const completedTasks = categories.reduce(
    (total, category) =>
      total +
      category.tasks.filter(
        (task) => task.completed
      ).length,
    0
  );

  const pendingTasks =
    totalTasks - completedTasks;

  const overallProgress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  // Search + filter
  const filteredCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,

      tasks: category.tasks.filter(
        (task) => {
          const matchesSearch =
            task.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesFilter =
            filter === "all" ||
            (filter === "completed" &&
              task.completed) ||
            (filter === "pending" &&
              !task.completed);

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      ),
    }));
  }, [
    categories,
    search,
    filter,
  ]);

  // Toggle task
  const toggleTask = async (
    categoryId,
    taskId
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/${taskId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "SESSION_EXPIRED"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update task"
        );
      }

      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
                ...category,

                tasks:
                  category.tasks.map(
                    (task) =>
                      task.id === taskId
                        ? {
                            ...task,
                            completed:
                              data.completed,
                          }
                        : task
                  ),
              }
            : category
        )
      );
    } catch (error) {
      console.error(
        "Toggle error:",
        error
      );

      if (
        error.message ===
        "SESSION_EXPIRED"
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to update task."
        );
      }
    }
  };

  // Delete task
  const deleteTask = async (
    categoryId,
    taskId
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/${taskId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "SESSION_EXPIRED"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete task"
        );
      }

      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? {
                ...category,

                tasks:
                  category.tasks.filter(
                    (task) =>
                      task.id !== taskId
                  ),
              }
            : category
        )
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      if (
        error.message ===
        "SESSION_EXPIRED"
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to delete task."
        );
      }
    }
  };

  // Handle task input
  const handleTaskInput = (
    categoryId,
    value
  ) => {
    setNewTasks((current) => ({
      ...current,
      [categoryId]: value,
    }));
  };

  // Add task
  const addTask = async (
    categoryId
  ) => {
    const category =
      categories.find(
        (item) =>
          item.id === categoryId
      );

    const taskName =
      newTasks[categoryId]?.trim();

    if (
      !taskName ||
      !category
    ) {
      return;
    }

    try {
      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers:
            getAuthHeaders(),

          body: JSON.stringify({
            category:
              category.name,

            name: taskName,

            completed: false,
          }),
        }
      );

      const data =
        await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "SESSION_EXPIRED"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add task"
        );
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === categoryId
            ? {
                ...item,

                tasks: [
                  ...item.tasks,

                  {
                    id:
                      data._id ||
                      data.id,

                    name: data.name,

                    completed:
                      data.completed,
                  },
                ],
              }
            : item
        )
      );

      setNewTasks((current) => ({
        ...current,
        [categoryId]: "",
      }));
    } catch (error) {
      console.error(
        "Add task error:",
        error
      );

      if (
        error.message ===
        "SESSION_EXPIRED"
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to add task."
        );
      }
    }
  };

  // Clear completed tasks
  const clearCompleted = async () => {
    const completedTaskIds =
      categories.flatMap(
        (category) =>
          category.tasks
            .filter(
              (task) =>
                task.completed
            )
            .map(
              (task) =>
                task.id
            )
      );

    try {
      const results =
        await Promise.all(
          completedTaskIds.map(
            (taskId) =>
              fetch(
                `${API_URL}/${taskId}`,
                {
                  method:
                    "DELETE",

                  headers:
                    getAuthHeaders(),
                }
              )
          )
        );

      const unauthorized =
        results.some(
          (response) =>
            response.status ===
              401 ||
            response.status ===
              403
        );

      if (unauthorized) {
        throw new Error(
          "SESSION_EXPIRED"
        );
      }

      const failed =
        results.some(
          (response) =>
            !response.ok
        );

      if (failed) {
        throw new Error(
          "Failed to clear completed tasks"
        );
      }

      setCategories((current) =>
        current.map(
          (category) => ({
            ...category,

            tasks:
              category.tasks.filter(
                (task) =>
                  !task.completed
              ),
          })
        )
      );
    } catch (error) {
      console.error(
        "Clear completed error:",
        error
      );

      if (
        error.message ===
        "SESSION_EXPIRED"
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setUser(null);

        setError(
          "Your session has expired. Please login again."
        );
      } else {
        setError(
          "Unable to clear completed tasks."
        );
      }
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);

    setCategories(
      initialCategories
    );

    setSearch("");
    setFilter("all");
    setNewTasks({});
    setError("");
  };

  // Login screen
  if (!user) {
    return (
      <Auth
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />
    );
  }

  return (
    <div className="app">

      <header className="header">

        <div>

          <p className="eyebrow">
            PLACEMENT PREPARATION
          </p>

          <h1>
            Placement Tracker
          </h1>

          <p>
            Track your coding,
            aptitude, courses,
            projects and interview
            preparation.
          </p>

          <div className="user-section">

            <span>
              Hi, {user.name}
            </span>

            <button
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </div>

        </div>

        <div className="header-progress">

          <strong>
            {overallProgress}%
          </strong>

          <span>
            Overall Progress
          </span>

        </div>

      </header>

      <main>

        {error && (
          <div className="error-message">

            {error}

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {loading ? (

          <div className="loading">
            Loading your placement
            tasks...
          </div>

        ) : (

          <>

            <section className="overall-progress">

              <div className="section-heading">

                <div>

                  <p className="small-label">
                    YOUR PROGRESS
                  </p>

                  <h2>
                    Overall Preparation
                  </h2>

                </div>

                <span className="progress-percentage">
                  {overallProgress}%
                </span>

              </div>

              <div className="overall-progress-container">

                <div
                  className="overall-progress-bar"
                  style={{
                    width:
                      `${overallProgress}%`,
                  }}
                />

              </div>

              <p className="progress-message">

                {overallProgress ===
                100
                  ? "Excellent! You are fully prepared."
                  : overallProgress >=
                    70
                  ? "Great progress! Keep pushing."
                  : overallProgress >=
                    40
                  ? "Good start. Stay consistent."
                  : "Start completing tasks to build momentum."}

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

                <small>
                  All categories
                </small>

              </div>

              <div className="stat-card success-card">

                <span>
                  Completed
                </span>

                <strong>
                  {completedTasks}
                </strong>

                <small>
                  Tasks finished
                </small>

              </div>

              <div className="stat-card warning-card">

                <span>
                  Pending
                </span>

                <strong>
                  {pendingTasks}
                </strong>

                <small>
                  Tasks remaining
                </small>

              </div>

            </section>

            <section className="controls">

              <div className="search-container">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="filter-buttons">

                <button
                  className={
                    filter === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("all")
                  }
                >
                  All
                </button>

                <button
                  className={
                    filter === "pending"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      "pending"
                    )
                  }
                >
                  Pending
                </button>

                <button
                  className={
                    filter === "completed"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      "completed"
                    )
                  }
                >
                  Completed
                </button>

              </div>

              <button
                className="clear-button"
                onClick={
                  clearCompleted
                }
              >
                Clear Completed
              </button>

            </section>

            <div className="section-title-row">

              <div>

                <p className="small-label">
                  PREPARATION AREAS
                </p>

                <h2 className="section-title">
                  Your Categories
                </h2>

              </div>

              <span className="category-count">

                {categories.length}
                {" "}
                Categories

              </span>

            </div>

            <section className="dashboard">

              {filteredCategories.map(
                (category) => {

                  const allTasks =
                    categories.find(
                      (item) =>
                        item.id ===
                        category.id
                    )?.tasks || [];

                  const completedCount =
                    allTasks.filter(
                      (task) =>
                        task.completed
                    ).length;

                  const progress =
                    category.target >
                    0
                      ? Math.min(
                          100,
                          Math.round(
                            (completedCount /
                              category.target) *
                              100
                          )
                        )
                      : 0;

                  return (

                    <div
                      className="category-card"
                      key={
                        category.id
                      }
                    >

                      <div className="category-header">

                        <div>

                          <h2>
                            {category.name}
                          </h2>

                          <p>
                            {completedCount}
                            {" "}
                            completed /
                            {" "}
                            {category.target}
                            {" "}
                            target
                          </p>

                        </div>

                        <div className="category-icon">
                          {category.name.charAt(
                            0
                          )}
                        </div>

                      </div>

                      <div className="progress-container">

                        <div
                          className="progress-bar"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>

                      <div className="category-progress">

                        <span>
                          {progress}%
                          {" "}
                          complete
                        </span>

                        <span>
                          {completedCount}/
                          {category.target}
                        </span>

                      </div>

                      <div className="add-task">

                        <input
                          type="text"
                          placeholder={
                            `Add ${category.name} task...`
                          }
                          value={
                            newTasks[
                              category.id
                            ] || ""
                          }
                          onChange={(e) =>
                            handleTaskInput(
                              category.id,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => {

                            if (
                              e.key ===
                              "Enter"
                            ) {
                              addTask(
                                category.id
                              );
                            }

                          }}
                        />

                        <button
                          onClick={() =>
                            addTask(
                              category.id
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                      <div className="task-list">

                        {category.tasks
                          .length ===
                        0 ? (

                          <div className="empty-state">
                            No tasks found.
                          </div>

                        ) : (

                          category.tasks.map(
                            (task) => (

                              <div
                                className="task"
                                key={
                                  task.id
                                }
                              >

                                <input
                                  type="checkbox"
                                  checked={
                                    task.completed
                                  }
                                  onChange={() =>
                                    toggleTask(
                                      category.id,
                                      task.id
                                    )
                                  }
                                />

                                <span
                                  className={
                                    task.completed
                                      ? "completed"
                                      : ""
                                  }
                                >
                                  {task.name}
                                </span>

                                <button
                                  className="delete"
                                  onClick={() =>
                                    deleteTask(
                                      category.id,
                                      task.id
                                    )
                                  }
                                  title="Delete task"
                                >
                                  ×
                                </button>

                              </div>

                            )
                          )

                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </section>

          </>

        )}

      </main>

      <footer>

        <p>
          Placement Tracker • Keep
          learning. Keep building. 🚀
        </p>

      </footer>

    </div>
  );
}

export default App;