import { useState } from "react";
import { useAuth } from "./AuthContext";

import {
    loginUser,
    registerUser
} from "./api";

function Auth({ onLogin }) {

    const { login } = useAuth();

    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {

        event.preventDefault();

        setMessage("");

        setLoading(true);

        try {

            if (isLogin) {

                const data = await loginUser(
                    email,
                    password
                );

                login(
                    data.user,
                    data.token
                );

                if (onLogin) {
                    onLogin(data.user);
                }

            } else {

                await registerUser(
                    name,
                    email,
                    password
                );

                setMessage(
                    "Registration successful! Please login."
                );

                setIsLogin(true);

                setName("");

                setPassword("");
            }

        } catch (error) {

            setMessage(
                error.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);
        }
    }

    function switchMode() {

        setIsLogin(!isLogin);

        setMessage("");

        setName("");

        setEmail("");

        setPassword("");
    }

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <div className="auth-icon">
                        🚀
                    </div>

                    <p className="eyebrow">
                        PLACEMENT TRACKER
                    </p>

                    <h1>
                        {isLogin
                            ? "Welcome Back"
                            : "Create Account"}
                    </h1>

                    <p>
                        {isLogin
                            ? "Login to continue your placement preparation."
                            : "Create an account to start tracking your preparation."}
                    </p>

                </div>

                {message && (
                    <div className="auth-message">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {!isLogin && (
                        <div className="auth-field">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                            />

                        </div>
                    )}

                    <div className="auth-field">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />

                    </div>

                    <div className="auth-field">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            minLength="6"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                                ? "Login"
                                : "Create Account"}
                    </button>

                </form>

                <div className="auth-switch">

                    <span>
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
                    </span>

                    <button
                        type="button"
                        onClick={switchMode}
                    >
                        {isLogin
                            ? "Register"
                            : "Login"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Auth;