const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// MongoDB Connection
// =========================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });


// =========================
// User Schema
// =========================

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);


// =========================
// Task Schema
// =========================

const taskSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        completed: {
            type: Boolean,
            default: false
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);


// =========================
// JWT Authentication
// =========================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
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
            message: "Invalid or expired token"
        });
    }
}


// =========================
// Register
// =========================

app.post("/api/auth/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {

            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });
        }


        // Hash password before storing
        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });


        res.status(201).json({
            message: "Registration successful",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// Login
// =========================

app.post("/api/auth/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        let passwordMatch = false;


        // Check whether password is already hashed
        const isBcryptHash =
            user.password.startsWith("$2a$") ||
            user.password.startsWith("$2b$") ||
            user.password.startsWith("$2y$");


        if (isBcryptHash) {

            passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

        } else {

            // Support users created before Day 21
            passwordMatch =
                password === user.password;


            // Convert old plain-text password
            // into a secure bcrypt password
            if (passwordMatch) {

                user.password =
                    await bcrypt.hash(
                        password,
                        10
                    );

                await user.save();
            }
        }


        if (!passwordMatch) {

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Create JWT
        const token =
            jwt.sign(
                {
                    userId: user._id.toString(),
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );


        res.json({

            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// Get Tasks
// =========================

app.get(
    "/api/tasks",
    authenticateToken,
    async (req, res) => {

        try {

            const tasks =
                await Task.find({
                    userId: req.user.userId
                });

            res.json(tasks);

        } catch (error) {

            console.error("Get tasks error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// Add Task
// =========================

app.post(
    "/api/tasks",
    authenticateToken,
    async (req, res) => {

        try {

            const { category, name } = req.body;

            if (!category || !name) {

                return res.status(400).json({
                    message: "Category and task name are required"
                });
            }

            const task =
                await Task.create({

                    category,

                    name,

                    completed: false,

                    userId: req.user.userId
                });

            res.status(201).json(task);

        } catch (error) {

            console.error("Add task error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// Update Task
// =========================

app.put(
    "/api/tasks/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const { id } = req.params;

            const { name, completed } = req.body;

            const task =
                await Task.findOne({
                    _id: id,
                    userId: req.user.userId
                });

            if (!task) {

                return res.status(404).json({
                    message: "Task not found"
                });
            }


            if (name !== undefined) {
                task.name = name;
            }

            if (completed !== undefined) {
                task.completed = completed;
            }


            await task.save();

            res.json(task);

        } catch (error) {

            console.error("Update task error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// Delete Task
// =========================

app.delete(
    "/api/tasks/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const { id } = req.params;

            const task =
                await Task.findOneAndDelete({
                    _id: id,
                    userId: req.user.userId
                });

            if (!task) {

                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.json({
                message: "Task deleted successfully"
            });

        } catch (error) {

            console.error("Delete task error:", error);

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// Start Server
// =========================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );
});