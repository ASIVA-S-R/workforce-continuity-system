import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EmployeeProfile() {
    const navigate = useNavigate();

    const employeeId = 2;

    const [employee, setEmployee] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        departmentId: ""
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // LOAD EMPLOYEE
    // =====================================================

    const loadEmployee = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `http://localhost:8080/api/employees/${employeeId}`
            );

            const data = response.data;

            setEmployee(data);

            setFormData({
                name: data.name || "",
                email: data.email || "",
                role: data.role || "",
                departmentId: data.departmentId || ""
            });
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load employee profile."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD ON PAGE OPEN
    // =====================================================

    useEffect(() => {
        loadEmployee();
    }, []);

    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSave = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        // Validation
        if (!formData.name.trim()) {
            setError("Name cannot be empty.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email cannot be empty.");
            return;
        }

        if (!formData.role.trim()) {
            setError("Role cannot be empty.");
            return;
        }

        if (!formData.departmentId) {
            setError("Department ID is required.");
            return;
        }

        try {
            setSaving(true);

            const response = await axios.put(
                `http://localhost:8080/api/employees/${employeeId}`,
                {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role.trim(),
                    departmentId: Number(formData.departmentId)
                }
            );

            const updatedEmployee = response.data;

            setEmployee(updatedEmployee);

            setFormData({
                name: updatedEmployee.name || "",
                email: updatedEmployee.email || "",
                role: updatedEmployee.role || "",
                departmentId:
                    updatedEmployee.departmentId || ""
            });

            setEditing(false);

            setSuccess(
                "Profile updated successfully!"
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to update employee profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // CANCEL EDIT
    // =====================================================

    const handleCancel = () => {
        if (!employee) {
            return;
        }

        setFormData({
            name: employee.name || "",
            email: employee.email || "",
            role: employee.role || "",
            departmentId: employee.departmentId || ""
        });

        setEditing(false);
        setError("");
        setSuccess("");
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="container mt-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p className="mt-3">
                    Loading Employee Profile...
                </p>

            </div>
        );
    }

    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h1 className="fw-bold">
                            Employee Profile
                        </h1>

                        <p className="text-muted mb-0">
                            Manage your employee information
                        </p>

                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={loadEmployee}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>

                </div>

                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <div className="d-flex flex-wrap gap-2">

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    navigate("/employee")
                                }
                            >
                                Dashboard
                            </button>

                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={() =>
                                    navigate("/apply-leave")
                                }
                            >
                                Apply Leave
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    navigate("/leave-history")
                                }
                            >
                                Leave History
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() =>
                                    navigate("/leave-calendar")
                                }
                            >
                                Calendar
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate("/employee-profile")
                                }
                            >
                                Profile
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-dark"
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                Home
                            </button>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (
                    <div className="alert alert-danger">

                        <strong>Error:</strong>{" "}
                        {error}

                    </div>
                )}

                {success && (
                    <div className="alert alert-success">

                        <strong>✓ Success:</strong>{" "}
                        {success}

                    </div>
                )}

                {/* =================================================
                    PROFILE
                ================================================= */}

                {employee ? (

                    <div className="row justify-content-center">

                        <div className="col-lg-8">

                            <div className="card shadow-sm border-0">

                                {/* =================================================
                                    PROFILE HEADER
                                ================================================= */}

                                <div className="card-body text-center border-bottom">

                                    <div
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                        style={{
                                            width: "90px",
                                            height: "90px",
                                            fontSize: "36px"
                                        }}
                                    >
                                        {employee.name
                                            ? employee.name
                                                .charAt(0)
                                                .toUpperCase()
                                            : "U"}
                                    </div>

                                    <h2 className="fw-bold">
                                        {employee.name}
                                    </h2>

                                    <p className="text-muted mb-0">
                                        Employee ID: {employee.id}
                                    </p>

                                </div>

                                {/* =================================================
                                    PROFILE INFORMATION
                                ================================================= */}

                                <div className="card-body">

                                    {!editing ? (

                                        <>
                                            <h4 className="fw-bold mb-4">
                                                Employee Information
                                            </h4>

                                            <div className="row g-3">

                                                {/* NAME */}

                                                <div className="col-md-6">

                                                    <div className="border rounded p-3 h-100">

                                                        <small className="text-muted">
                                                            Full Name
                                                        </small>

                                                        <div className="fw-semibold mt-1">
                                                            {employee.name}
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* EMPLOYEE ID */}

                                                <div className="col-md-6">

                                                    <div className="border rounded p-3 h-100">

                                                        <small className="text-muted">
                                                            Employee ID
                                                        </small>

                                                        <div className="fw-semibold mt-1">
                                                            {employee.id}
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* EMAIL */}

                                                <div className="col-md-6">

                                                    <div className="border rounded p-3 h-100">

                                                        <small className="text-muted">
                                                            Email
                                                        </small>

                                                        <div className="fw-semibold mt-1">
                                                            {employee.email}
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* ROLE */}

                                                <div className="col-md-6">

                                                    <div className="border rounded p-3 h-100">

                                                        <small className="text-muted">
                                                            Role
                                                        </small>

                                                        <div className="fw-semibold mt-1">
                                                            {employee.role}
                                                        </div>

                                                    </div>

                                                </div>

                                                {/* DEPARTMENT */}

                                                <div className="col-md-6">

                                                    <div className="border rounded p-3 h-100">

                                                        <small className="text-muted">
                                                            Department ID
                                                        </small>

                                                        <div className="fw-semibold mt-1">
                                                            {employee.departmentId ||
                                                                "Not assigned"}
                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* EDIT BUTTON */}

                                            <div className="mt-4">

                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={() => {
                                                        setEditing(true);
                                                        setError("");
                                                        setSuccess("");
                                                    }}
                                                >
                                                    ✏️ Edit Profile
                                                </button>

                                            </div>

                                        </>

                                    ) : (

                                        /* =================================================
                                            EDIT FORM
                                        ================================================= */

                                        <form onSubmit={handleSave}>

                                            <h4 className="fw-bold mb-4">
                                                Edit Employee Profile
                                            </h4>

                                            {/* NAME */}

                                            <div className="mb-3">

                                                <label className="form-label fw-semibold">
                                                    Full Name
                                                </label>

                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    disabled={saving}
                                                    required
                                                />

                                            </div>

                                            {/* EMAIL */}

                                            <div className="mb-3">

                                                <label className="form-label fw-semibold">
                                                    Email
                                                </label>

                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    disabled={saving}
                                                    required
                                                />

                                            </div>

                                            {/* ROLE */}

                                            <div className="mb-3">

                                                <label className="form-label fw-semibold">
                                                    Role
                                                </label>

                                                <input
                                                    type="text"
                                                    name="role"
                                                    className="form-control"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    disabled={saving}
                                                    required
                                                />

                                            </div>

                                            {/* DEPARTMENT */}

                                            <div className="mb-4">

                                                <label className="form-label fw-semibold">
                                                    Department ID
                                                </label>

                                                <input
                                                    type="number"
                                                    name="departmentId"
                                                    className="form-control"
                                                    min="1"
                                                    value={formData.departmentId}
                                                    onChange={handleChange}
                                                    disabled={saving}
                                                    required
                                                />

                                            </div>

                                            {/* BUTTONS */}

                                            <div className="d-flex gap-2">

                                                <button
                                                    type="submit"
                                                    className="btn btn-success"
                                                    disabled={saving}
                                                >

                                                    {saving ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        "Save Changes"
                                                    )}

                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={handleCancel}
                                                    disabled={saving}
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        </form>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                ) : (

                    <div className="alert alert-warning text-center">
                        Employee profile not found.
                    </div>

                )}

            </div>

        </div>
    );
}

export default EmployeeProfile;