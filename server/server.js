const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { Ollama } = require("ollama");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ollama = new Ollama({
    host: "http://127.0.0.1:11434"
});

// ===============================
// MongoDB Connection
// ===============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection error:",
            error.message
        );
    });

// ===============================
// User Schema
// ===============================

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
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

// ===============================
// Task Schema
// ===============================

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

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
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);

// ===============================
// JWT Authentication
// ===============================

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
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// ===============================
// Register
// ===============================

app.post("/api/auth/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error(
            "Registration error:",
            error.message
        );

        res.status(500).json({
            message: "Server error during registration"
        });
    }
});

// ===============================
// Login
// ===============================

app.post("/api/auth/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        let passwordMatch = false;

        const isBcryptPassword =
            user.password.startsWith("$2a$") ||
            user.password.startsWith("$2b$") ||
            user.password.startsWith("$2y$");

        if (isBcryptPassword) {
            passwordMatch = await bcrypt.compare(
                password,
                user.password
            );
        } else {
            passwordMatch =
                password === user.password;

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

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error(
            "Login error:",
            error.message
        );

        res.status(500).json({
            message: "Server error during login"
        });
    }
});

// ===============================
// Get Tasks
// ===============================

app.get(
    "/api/tasks",
    authenticateToken,
    async (req, res) => {
        try {
            const tasks = await Task.find({
                userId: req.user.userId
            }).sort({
                createdAt: 1
            });

            res.json(tasks);
        } catch (error) {
            console.error(
                "Get tasks error:",
                error.message
            );

            res.status(500).json({
                message: "Unable to fetch tasks"
            });
        }
    }
);

// ===============================
// Add Task
// ===============================

app.post(
    "/api/tasks",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                category,
                name
            } = req.body;

            if (!category || !name) {
                return res.status(400).json({
                    message:
                        "Category and task name are required"
                });
            }

            const task = await Task.create({
                userId: req.user.userId,
                category,
                name,
                completed: false
            });

            res.status(201).json(task);
        } catch (error) {
            console.error(
                "Add task error:",
                error.message
            );

            res.status(500).json({
                message: "Unable to add task"
            });
        }
    }
);

// ===============================
// Update Task
// ===============================

app.put(
    "/api/tasks/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                id
            } = req.params;

            const {
                name,
                completed
            } = req.body;

            const task = await Task.findOne({
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
            console.error(
                "Update task error:",
                error.message
            );

            res.status(500).json({
                message: "Unable to update task"
            });
        }
    }
);

// ===============================
// Delete Task
// ===============================

app.delete(
    "/api/tasks/:id",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                id
            } = req.params;

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
                message:
                    "Task deleted successfully"
            });
        } catch (error) {
            console.error(
                "Delete task error:",
                error.message
            );

            res.status(500).json({
                message: "Unable to delete task"
            });
        }
    }
);

// ===============================
// AI Assistant - Ollama
// ===============================

app.post(
    "/api/ai/assistant",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                message,
                progress
            } = req.body;

            if (!message || !message.trim()) {
                return res.status(400).json({
                    message: "Message is required"
                });
            }

            const progressText = progress
                ? JSON.stringify(
                      progress,
                      null,
                      2
                  )
                : "No placement progress was provided.";

            console.log(
                "AI request received"
            );

            console.log(
                "User:",
                req.user.email
            );

            console.log(
                "Progress received:",
                progressText
            );

            const prompt = `
You are an AI placement preparation assistant.

Help the student with:

- DSA
- Java
- Coding Practice
- Aptitude
- SQL
- DBMS
- OOP
- Interview Preparation
- Projects
- Placement preparation

Give simple, practical and beginner-friendly answers.

IMPORTANT PROGRESS RULES:

1. "target" is the student's total target for that category.
2. "total" is only the number of tasks currently created.
3. "completed" is the number of currently created tasks that are completed.
4. "pending" means currently created tasks that are not completed.
5. "percentage" is progress toward the category target.
6. Never calculate target progress using completed / total.
7. Do not invent progress data.

Student's question:

${message.trim()}

Current placement progress:

${progressText}

Give a useful and practical answer.
`;

            const response =
                await ollama.chat({
                    model: "llama3.2:3b",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                });

            console.log(
                "AI response received successfully"
            );

            res.json({
                reply:
                    response.message?.content ||
                    "No response received from AI."
            });
        } catch (error) {
            console.error(
                "================================="
            );

            console.error(
                "OLLAMA AI ASSISTANT ERROR"
            );

            console.error(
                "================================="
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Full error:",
                error
            );

            console.error(
                "================================="
            );

            res.status(500).json({
                message:
                    "Unable to connect to local AI. Make sure Ollama is running."
            });
        }
    }
);

// ===============================
// Day 33 - AI Interview Coach
// ===============================

app.post(
    "/api/ai/interview",
    authenticateToken,
    async (req, res) => {
        try {
            const {
                category,
                answer,
                question
            } = req.body;

            if (!category) {
                return res.status(400).json({
                    message:
                        "Interview category is required"
                });
            }

            let prompt;

            // Generate a new interview question
            if (!question) {
                prompt = `
You are an AI technical interview coach.

The student is preparing for placements.

Interview category:
${category}

Generate ONE beginner-friendly interview question
for this category.

Rules:

- Ask only one question.
- Do not provide the answer.
- Keep the question suitable for a college student.
- If the category is DSA, ask a conceptual or
  beginner coding interview question.
- If the category is Java, ask a Java interview question.
- If the category is OOP, ask an OOP interview question.
- If the category is DBMS, ask a DBMS interview question.
- If the category is SQL, ask an SQL interview question.
- If the category is HR, ask an HR interview question.

Return only the interview question.
`;
            } else {
                // Evaluate student's answer
                prompt = `
You are an AI technical interview coach.

Interview category:
${category}

Interview question:
${question}

Student's answer:
${answer || "No answer provided."}

Evaluate the student's answer.

Give the response in this format:

Score: X/10

What you did well:
- ...

What you missed:
- ...

Better answer:
...

Tips:
- ...

Rules:

- Be beginner-friendly.
- Be honest but encouraging.
- Do not invent information about the student's answer.
- If the answer is incomplete, clearly explain what is missing.
- Keep the evaluation practical for placement interviews.
`;
            }

            console.log(
                "Interview Coach request received"
            );

            console.log(
                "User:",
                req.user.email
            );

            console.log(
                "Category:",
                category
            );

            const response =
                await ollama.chat({
                    model: "llama3.2:3b",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                });

            console.log(
                "Interview Coach response received"
            );

            res.json({
                reply:
                    response.message?.content ||
                    "No interview response received."
            });
        } catch (error) {
            console.error(
                "================================="
            );

            console.error(
                "INTERVIEW COACH ERROR"
            );

            console.error(
                "================================="
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "Full error:",
                error
            );

            console.error(
                "================================="
            );

            res.status(500).json({
                message:
                    "Unable to connect to Interview Coach AI."
            });
        }
    }
);

// ===============================
// Start Server
// ===============================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    }
);