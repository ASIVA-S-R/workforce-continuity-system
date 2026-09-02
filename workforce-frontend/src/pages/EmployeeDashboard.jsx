import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function EmployeeDashboard() {

    const navigate = useNavigate();

    const employeeId = 2;

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axios.get(
                `http://localhost:8080/api/employees/${employeeId}/dashboard`
            );

            setDashboard(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load employee dashboard."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {

        return (
            <div className="container mt-5 text-center">

                <div className="spinner-border text-primary"></div>

                <p className="mt-3">
                    Loading Employee Dashboard...
                </p>

            </div>
        );
    }

    if (error) {

        return (
            <div className="container mt-5">

                <div className="alert alert-danger">
                    {error}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={loadDashboard}
                >
                    Try Again
                </button>

            </div>
        );
    }

    const employee = dashboard?.employee;
    const balance = dashboard?.leaveBalance;
    const history = dashboard?.leaveHistory || [];

    /*
     * ---------------------------------------------------
     * LEAVE STATUS CALCULATION
     * ---------------------------------------------------
     */

    const approvedLeaves = history.filter(
        leave => leave.status === "APPROVED"
    ).length;

    const rejectedLeaves = history.filter(
        leave => leave.status === "REJECTED"
    ).length;

    const pendingLeaves = history.filter(
        leave => leave.status === "PENDING"
    ).length;


    /*
     * ---------------------------------------------------
     * LEAVE USAGE CHART
     * ---------------------------------------------------
     */

    const usedLeaves = balance?.usedLeaves ?? 0;

    const remainingLeaves = balance?.remainingLeaves ?? 0;

    const leaveUsageData = {

        labels: [
            "Used Leaves",
            "Remaining Leaves"
        ],

        datasets: [
            {
                data: [
                    usedLeaves,
                    remainingLeaves
                ],

                backgroundColor: [
                    "#dc3545",
                    "#198754"
                ],

                borderWidth: 1
            }
        ]
    };


    /*
     * ---------------------------------------------------
     * LEAVE STATUS CHART
     * ---------------------------------------------------
     */

    const leaveStatusData = {

        labels: [
            "Approved",
            "Pending",
            "Rejected"
        ],

        datasets: [
            {
                data: [
                    approvedLeaves,
                    pendingLeaves,
                    rejectedLeaves
                ],

                backgroundColor: [
                    "#198754",
                    "#ffc107",
                    "#dc3545"
                ],

                borderWidth: 1
            }
        ]
    };


    const chartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                position: "bottom"
            }

        }

    };


    return (

        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">

                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h1 className="fw-bold">
                            Employee Dashboard
                        </h1>

                        <p className="text-muted mb-0">
                            Workforce Continuity System
                        </p>

                    </div>

                    <button
                        className="btn btn-outline-primary"
                        onClick={loadDashboard}
                    >
                        Refresh
                    </button>

                </div>


                {/* =========================================
                    NAVIGATION
                ========================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <div className="d-flex flex-wrap gap-2">

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/employee")}
                            >
                                Dashboard
                            </button>

                            <button
                                className="btn btn-success"
                                onClick={() => navigate("/apply-leave")}
                            >
                                Apply Leave
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigate("/leave-history")}
                            >
                                Leave History
                            </button>

                            <button
                                className="btn btn-outline-dark"
                                onClick={() => navigate("/")}
                            >
                                Home
                            </button>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    EMPLOYEE INFORMATION
                ========================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <h3 className="mb-4">
                            Employee Information
                        </h3>

                        <div className="row">

                            <div className="col-md-6 mb-3">

                                <strong>
                                    Name
                                </strong>

                                <p className="mb-0">
                                    {employee?.name}
                                </p>

                            </div>


                            <div className="col-md-6 mb-3">

                                <strong>
                                    Employee ID
                                </strong>

                                <p className="mb-0">
                                    {employee?.id}
                                </p>

                            </div>


                            <div className="col-md-6 mb-3">

                                <strong>
                                    Email
                                </strong>

                                <p className="mb-0">
                                    {employee?.email}
                                </p>

                            </div>


                            <div className="col-md-6 mb-3">

                                <strong>
                                    Role
                                </strong>

                                <p className="mb-0">
                                    {employee?.role}
                                </p>

                            </div>


                            <div className="col-md-6">

                                <strong>
                                    Department ID
                                </strong>

                                <p className="mb-0">
                                    {employee?.departmentId}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    LEAVE BALANCE
                ========================================= */}

                <h3 className="mb-3">
                    Leave Balance
                </h3>

                <div className="row g-4 mb-5">

                    {/* Total */}

                    <div className="col-md-4">

                        <div className="card shadow-sm border-0 text-center h-100">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Total Leaves
                                </h6>

                                <h2 className="fw-bold">
                                    {balance?.totalLeaves ?? 0}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* Used */}

                    <div className="col-md-4">

                        <div className="card shadow-sm border-0 text-center h-100">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Used Leaves
                                </h6>

                                <h2 className="fw-bold text-danger">
                                    {balance?.usedLeaves ?? 0}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* Remaining */}

                    <div className="col-md-4">

                        <div className="card shadow-sm border-0 text-center h-100">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Remaining Leaves
                                </h6>

                                <h2 className="fw-bold text-success">
                                    {balance?.remainingLeaves ?? 0}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    LEAVE ANALYTICS
                ========================================= */}

                <h3 className="mb-3">
                    Leave Analytics
                </h3>

                <div className="row g-4 mb-5">


                    {/* =====================================
                        LEAVE USAGE CHART
                    ===================================== */}

                    <div className="col-lg-6">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h5 className="fw-bold mb-3">
                                    Leave Usage
                                </h5>

                                <div
                                    style={{
                                        height: "300px"
                                    }}
                                >

                                    <Doughnut
                                        data={leaveUsageData}
                                        options={chartOptions}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        LEAVE STATUS CHART
                    ===================================== */}

                    <div className="col-lg-6">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h5 className="fw-bold mb-3">
                                    Leave Request Status
                                </h5>

                                <div
                                    style={{
                                        height: "300px"
                                    }}
                                >

                                    <Doughnut
                                        data={leaveStatusData}
                                        options={chartOptions}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    ANALYTICS SUMMARY CARDS
                ========================================= */}

                <div className="row g-4 mb-5">


                    {/* Approved */}

                    <div className="col-md-4">

                        <div className="card border-0 shadow-sm">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Approved Requests
                                </h6>

                                <h2 className="fw-bold text-success">
                                    {approvedLeaves}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* Pending */}

                    <div className="col-md-4">

                        <div className="card border-0 shadow-sm">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Pending Requests
                                </h6>

                                <h2 className="fw-bold text-warning">
                                    {pendingLeaves}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* Rejected */}

                    <div className="col-md-4">

                        <div className="card border-0 shadow-sm">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Rejected Requests
                                </h6>

                                <h2 className="fw-bold text-danger">
                                    {rejectedLeaves}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    RECENT LEAVE HISTORY
                ========================================= */}

                <div className="card shadow-sm border-0">

                    <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <h3 className="mb-0">
                                Recent Leave History
                            </h3>

                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate("/leave-history")}
                            >
                                View All
                            </button>

                        </div>


                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-dark">

                                <tr>

                                    <th>ID</th>

                                    <th>
                                        Leave Type
                                    </th>

                                    <th>
                                        Start Date
                                    </th>

                                    <th>
                                        End Date
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {history.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center py-4"
                                        >
                                            No leave history found.
                                        </td>

                                    </tr>

                                ) : (

                                    history.map((leave) => (

                                        <tr key={leave.id}>

                                            <td>
                                                {leave.id}
                                            </td>

                                            <td>
                                                {leave.leaveType}
                                            </td>

                                            <td>
                                                {leave.startDate}
                                            </td>

                                            <td>
                                                {leave.endDate}
                                            </td>

                                            <td>
                                                {leave.reason}
                                            </td>

                                            <td>

                                                {leave.status === "APPROVED" && (

                                                    <span className="badge bg-success">
                                                        APPROVED
                                                    </span>

                                                )}

                                                {leave.status === "REJECTED" && (

                                                    <span className="badge bg-danger">
                                                        REJECTED
                                                    </span>

                                                )}

                                                {leave.status === "PENDING" && (

                                                    <span className="badge bg-warning text-dark">
                                                        PENDING
                                                    </span>

                                                )}

                                            </td>

                                        </tr>

                                    ))

                                )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default EmployeeDashboard;