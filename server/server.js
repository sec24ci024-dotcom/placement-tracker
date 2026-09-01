const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =========================
   MONGODB CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

/* =========================
   USER MODEL
========================= */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

/* =========================
   TASK MODEL
========================= */

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

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

/* =========================
   JWT MIDDLEWARE
========================= */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. Invalid token.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token.",
    });
  }
};

/* =========================
   AUTH - REGISTER
========================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
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
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration.",
    });
  }
});

/* =========================
   AUTH - LOGIN
========================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
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
      message: "Server error during login.",
    });
  }
});

/* =========================
   GET TASKS
   PROTECTED ROUTE
========================= */

app.get(
  "/api/tasks",
  authenticateToken,
  async (req, res) => {
    try {
      const tasks = await Task.find({
        userId: req.user.userId,
      }).sort({ createdAt: 1 });

      res.json(tasks);
    } catch (error) {
      console.error("Get tasks error:", error);

      res.status(500).json({
        message: "Failed to fetch tasks.",
      });
    }
  }
);

/* =========================
   ADD TASK
   PROTECTED ROUTE
========================= */

app.post(
  "/api/tasks",
  authenticateToken,
  async (req, res) => {
    try {
      const { category, name, completed } =
        req.body;

      if (!category || !name) {
        return res.status(400).json({
          message:
            "Category and task name are required.",
        });
      }

      const task = await Task.create({
        category,
        name,
        completed: completed || false,
        userId: req.user.userId,
      });

      res.status(201).json(task);
    } catch (error) {
      console.error("Add task error:", error);

      res.status(500).json({
        message: "Failed to add task.",
      });
    }
  }
);

/* =========================
   DELETE TASK
   PROTECTED ROUTE
========================= */

app.delete(
  "/api/tasks/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).json({
          message: "Task not found.",
        });
      }

      res.json({
        message: "Task deleted successfully.",
      });
    } catch (error) {
      console.error("Delete task error:", error);

      res.status(500).json({
        message: "Failed to delete task.",
      });
    }
  }
);

/* =========================
   TOGGLE TASK
   PROTECTED ROUTE
========================= */

app.put(
  "/api/tasks/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).json({
          message: "Task not found.",
        });
      }

      task.completed = !task.completed;

      await task.save();

      res.json(task);
    } catch (error) {
      console.error("Update task error:", error);

      res.status(500).json({
        message: "Failed to update task.",
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});