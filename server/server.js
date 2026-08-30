const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");

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

// ==================== REGISTER ====================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ==================== LOGIN ====================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// ==================== TASK APIs ====================

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({
      createdAt: 1,
    });

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

// ==================== SERVER ====================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});