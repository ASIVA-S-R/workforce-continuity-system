import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setMessage("");

        if (!username || !password) {
            setMessage("Please enter username and password.");
            return;
        }

        setLoading(true);

        try {

            const response = await api.post("/auth/login", {
                username: username,
                password: password
            });

            console.log("Login response:", response.data);

            /*
             * Save JWT token
             */
            const token = response.data.token;

            if (!token) {
                setMessage("Login successful, but JWT token was not received.");
                return;
            }

            localStorage.setItem("token", token);

            /*
             * Get role from response
             *
             * Depending on your backend, it may be:
             * response.data.role
             * or response.data.user.role
             */

            const role =
                response.data.role ||
                response.data.user?.role;

            console.log("User role:", role);

            /*
             * Redirect according to role
             */

            if (role === "MANAGER" || role === "Manager") {

                navigate("/manager/dashboard");

            } else if (role === "EMPLOYEE" || role === "Employee") {

                navigate("/employee/dashboard");

            } else {

                setMessage(
                    "Login successful, but user role was not recognized."
                );
            }

        } catch (error) {

            console.error("Login error:", error);

            if (error.response) {

                console.log(
                    "Backend response:",
                    error.response.data
                );

                setMessage(
                    error.response.data?.message ||
                    "Invalid username or password."
                );

            } else if (error.request) {

                setMessage(
                    "Cannot connect to the backend. Make sure Spring Boot is running on port 8080."
                );

            } else {

                setMessage(
                    "Something went wrong. Please try again."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div
            className="min-vh-100 d-flex justify-content-center align-items-center"
            style={{
                background:
                    "linear-gradient(135deg, #f8f9fa 0%, #e9f2ff 100%)"
            }}
        >

            <div
                className="card border-0 shadow-lg"
                style={{
                    width: "400px",
                    maxWidth: "90%"
                }}
            >

                <div className="card-body p-4 p-lg-5">

                    <div className="text-center mb-4">

                        <h2 className="fw-bold">
                            Workforce System
                        </h2>

                        <p className="text-muted">
                            Login to your account
                        </p>

                    </div>


                    <form onSubmit={handleLogin}>

                        {/* USERNAME */}

                        <div className="mb-3">

                            <label className="form-label fw-semibold">
                                Username
                            </label>

                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                autoComplete="username"
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="mb-3">

                            <label className="form-label fw-semibold">
                                Password
                            </label>

                            <input
                                type="password"
                                className="form-control form-control-lg"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                            />

                        </div>


                        {/* MESSAGE */}

                        {message && (

                            <div className="alert alert-danger">
                                {message}
                            </div>

                        )}


                        {/* LOGIN BUTTON */}

                        <div className="d-grid">

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                            >

                                {loading
                                    ? "Logging in..."
                                    : "Login"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Login;
