import { useState } from "react";
import { useAuth } from "./AuthContext";

const API_URL = "http://localhost:5000/api/auth";

function Auth({ onLogin }) {
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const endpoint = isLogin
        ? `${API_URL}/login`
        : `${API_URL}/register`;

      const body = isLogin
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        login(data.user, data.token);

        if (onLogin) {
          onLogin(data.user);
        }
      } else {
        setMessage(
          "Registration successful! Please login."
        );

        setIsLogin(true);
        setName("");
        setPassword("");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <div className="auth-icon">🚀</div>

          <p className="eyebrow">
            PLACEMENT PREPARATION
          </p>

          <h1>
            {isLogin
              ? "Welcome Back"
              : "Create Account"}
          </h1>

          <p>
            {isLogin
              ? "Login to continue your preparation."
              : "Start tracking your placement journey."}
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

              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />

            </div>
          )}

          <div className="auth-field">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <div className="auth-field">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength="6"
              required
            />

          </div>

          <button
            className="auth-submit"
            type="submit"
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
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
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