const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Temporary database
let tasks = [
  {
    id: 1,
    category: "DSA",
    name: "Two Sum",
    completed: true,
  },
  {
    id: 2,
    category: "DSA",
    name: "Binary Search",
    completed: false,
  },
  {
    id: 3,
    category: "Courses",
    name: "React Fundamentals",
    completed: false,
  },
];

// GET all tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// ADD task
app.post("/api/tasks", (req, res) => {
  const newTask = {
    id: Date.now(),
    ...req.body,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// DELETE task
app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  tasks = tasks.filter((task) => task.id !== id);

  res.json({
    message: "Task deleted successfully",
  });
});

// TOGGLE completion
app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  tasks = tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  res.json({
    message: "Task updated",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});