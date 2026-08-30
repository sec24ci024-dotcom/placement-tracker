const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

const taskSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: 1 });

    res.json(
      tasks.map((task) => ({
        id: task._id,
        category: task.category,
        name: task.name,
        completed: task.completed,
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

// ADD task
app.post("/api/tasks", async (req, res) => {
  try {
    const { category, name, completed } = req.body;

    const newTask = await Task.create({
      category,
      name,
      completed: completed || false,
    });

    res.status(201).json({
      id: newTask._id,
      category: newTask.category,
      name: newTask.name,
      completed: newTask.completed,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add task",
    });
  }
});

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

// TOGGLE completion
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    task.completed = !task.completed;

    await task.save();

    res.json({
      message: "Task updated successfully",
      completed: task.completed,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});