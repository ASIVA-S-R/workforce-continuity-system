import { useEffect, useState } from "react";
import axios from "axios";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

import { useNavigate } from "react-router-dom";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

function ManagerDashboard() {
    const navigate = useNavigate();

    const departmentId = 1;

    const [summary, setSummary] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [leaveTypeFilter, setLeaveTypeFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    const loadManagerDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                summaryResponse,
                employeesResponse,
                leavesResponse,
            ] = await Promise.all([
                axios.get(
                    "http://localhost:8080/api/manager/dashboard"
                ),

                axios.get(
                    `http://localhost:8080/api/manager/department/${departmentId}/employees`
                ),

                axios.get(
                    "http://localhost:8080/api/manager/leaves"
                ),
            ]);

            setSummary(summaryResponse.data);
            setEmployees(employeesResponse.data);
            setLeaves(leavesResponse.data);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load Manager Dashboard."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadManagerDashboard();
    }, []);

    // =====================================================
    // APPROVE LEAVE
    // =====================================================

    const approveLeave = async (leaveId) => {
        try {
            setActionLoading(true);

            await axios.put(
                `http://localhost:8080/api/leaves/${leaveId}/approve`
            );

            await loadManagerDashboard();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to approve leave."
            );

        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // REJECT LEAVE
    // =====================================================

    const rejectLeave = async (leaveId) => {
        try {
            setActionLoading(true);

            await axios.put(
                `http://localhost:8080/api/leaves/${leaveId}/reject`
            );

            await loadManagerDashboard();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to reject leave."
            );

        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setLeaveTypeFilter("ALL");
    };

    // =====================================================
    // FILTER LEAVES
    // =====================================================

    const filteredLeaves = leaves.filter((leave) => {
        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            searchText === "" ||
            String(leave.employeeId)
                .toLowerCase()
                .includes(searchText) ||
            String(leave.leaveType)
                .toLowerCase()
                .includes(searchText) ||
            String(leave.reason)
                .toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "ALL" ||
            leave.status === statusFilter;

        const matchesLeaveType =
            leaveTypeFilter === "ALL" ||
            leave.leaveType === leaveTypeFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesLeaveType
        );
    });

    // =====================================================
    // LEAVE TYPES
    // =====================================================

    const leaveTypes = [
        ...new Set(
            leaves.map((leave) => leave.leaveType)
        ),
    ];

    // =====================================================
    // ANALYTICS
    // =====================================================

    const approvedCount = leaves.filter(
        (leave) => leave.status === "APPROVED"
    ).length;

    const pendingCount = leaves.filter(
        (leave) => leave.status === "PENDING"
    ).length;

    const rejectedCount = leaves.filter(
        (leave) => leave.status === "REJECTED"
    ).length;

    // =====================================================
    // DOUGHNUT CHART
    // =====================================================

    const leaveStatusData = {
        labels: [
            "Approved",
            "Pending",
            "Rejected",
        ],

        datasets: [
            {
                label: "Leave Status",

                data: [
                    approvedCount,
                    pendingCount,
                    rejectedCount,
                ],

                backgroundColor: [
                    "#198754",
                    "#ffc107",
                    "#dc3545",
                ],

                borderWidth: 1,
            },
        ],
    };

    const leaveStatusOptions = {
        responsive: true,

        plugins: {
            legend: {
                position: "bottom",
            },
        },
    };

    // =====================================================
    // LEAVE TYPE ANALYTICS
    // =====================================================

    const leaveTypeCounts = leaveTypes.map(
        (type) =>
            leaves.filter(
                (leave) => leave.leaveType === type
            ).length
    );

    const leaveTypeData = {
        labels: leaveTypes,

        datasets: [
            {
                label: "Number of Leaves",

                data: leaveTypeCounts,

                backgroundColor: "#0d6efd",

                borderRadius: 6,
            },
        ],
    };

    const leaveTypeOptions = {
        responsive: true,

        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    precision: 0,
                },
            },
        },

        plugins: {
            legend: {
                display: false,
            },
        },
    };

    // =====================================================
    // EMPLOYEE LEAVE ANALYTICS
    // =====================================================

    const employeeLeaveCounts = employees.map(
        (employee) =>
            leaves.filter(
                (leave) =>
                    leave.employeeId === employee.id
            ).length
    );

    const employeeLeaveData = {
        labels: employees.map(
            (employee) => employee.name
        ),

        datasets: [
            {
                label: "Leave Requests",

                data: employeeLeaveCounts,

                backgroundColor: "#6f42c1",

                borderRadius: 6,
            },
        ],
    };

    const employeeLeaveOptions = {
        responsive: true,

        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    precision: 0,
                },
            },
        },

        plugins: {
            legend: {
                display: false,
            },
        },
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="container mt-5 text-center">

                <div className="spinner-border text-success"></div>

                <p className="mt-3">
                    Loading Manager Dashboard...
                </p>

            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
        return (
            <div className="container mt-5">

                <div className="alert alert-danger">
                    {error}
                </div>

                <button
                    className="btn btn-success"
                    onClick={loadManagerDashboard}
                >
                    Try Again
                </button>

            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">

                {/* HEADER */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h1 className="fw-bold">
                            Manager Dashboard
                        </h1>

                        <p className="text-muted mb-0">
                            Workforce Continuity System
                        </p>

                    </div>

                    <button
                        className="btn btn-outline-success"
                        onClick={loadManagerDashboard}
                    >
                        🔄 Refresh
                    </button>

                </div>


                {/* NAVIGATION */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <div className="d-flex flex-wrap gap-2">

                            <button
                                className="btn btn-success"
                                onClick={() =>
                                    navigate("/manager")
                                }
                            >
                                Manager Dashboard
                            </button>

                            <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    navigate("/employee")
                                }
                            >
                                Employee Dashboard
                            </button>

                            <button
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
            SUMMARY
        ================================================= */}

                <h3 className="mb-3">
                    Dashboard Summary
                </h3>

                <div className="row g-4 mb-5">

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Total Employees
                                </h6>

                                <h2 className="fw-bold">
                                    {summary?.totalEmployees ?? 0}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Approved Leaves
                                </h6>

                                <h2 className="fw-bold text-success">
                                    {approvedCount}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Pending Leaves
                                </h6>

                                <h2 className="fw-bold text-warning">
                                    {pendingCount}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Rejected Leaves
                                </h6>

                                <h2 className="fw-bold text-danger">
                                    {rejectedCount}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
            ANALYTICS
        ================================================= */}

                <h3 className="mb-3">
                    Leave Analytics
                </h3>

                <div className="row g-4 mb-5">

                    {/* STATUS CHART */}

                    <div className="col-lg-4">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h5 className="fw-bold mb-4">
                                    Leave Status
                                </h5>

                                {leaves.length === 0 ? (

                                    <p className="text-muted text-center">
                                        No leave data available.
                                    </p>

                                ) : (

                                    <Doughnut
                                        data={leaveStatusData}
                                        options={leaveStatusOptions}
                                    />

                                )}

                            </div>

                        </div>

                    </div>


                    {/* LEAVE TYPE */}

                    <div className="col-lg-4">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h5 className="fw-bold mb-4">
                                    Leave Type Distribution
                                </h5>

                                {leaveTypes.length === 0 ? (

                                    <p className="text-muted text-center">
                                        No leave type data available.
                                    </p>

                                ) : (

                                    <Bar
                                        data={leaveTypeData}
                                        options={leaveTypeOptions}
                                    />

                                )}

                            </div>

                        </div>

                    </div>


                    {/* EMPLOYEE */}

                    <div className="col-lg-4">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h5 className="fw-bold mb-4">
                                    Employee Leave Requests
                                </h5>

                                {employees.length === 0 ? (

                                    <p className="text-muted text-center">
                                        No employee data available.
                                    </p>

                                ) : (

                                    <Bar
                                        data={employeeLeaveData}
                                        options={employeeLeaveOptions}
                                    />

                                )}

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
            DEPARTMENT EMPLOYEES
        ================================================= */}

                <div className="card shadow-sm border-0 mb-5">

                    <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <h3 className="mb-0">
                                Department Employees
                            </h3>

                            <span className="badge bg-primary">
                Department {departmentId}
              </span>

                        </div>


                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-dark">

                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                </tr>

                                </thead>


                                <tbody>

                                {employees.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="text-center py-4"
                                        >
                                            No employees found.
                                        </td>

                                    </tr>

                                ) : (

                                    employees.map(
                                        (employee) => (

                                            <tr key={employee.id}>

                                                <td>
                                                    {employee.id}
                                                </td>

                                                <td className="fw-semibold">
                                                    {employee.name}
                                                </td>

                                                <td>
                                                    {employee.email}
                                                </td>

                                                <td>
                                                    {employee.role}
                                                </td>

                                                <td>
                                                    {employee.departmentId}
                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>


                {/* =================================================
            LEAVE REQUESTS
        ================================================= */}

                <div className="card shadow-sm border-0">

                    <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <div>

                                <h3 className="mb-1">
                                    Leave Requests
                                </h3>

                                <small className="text-muted">
                                    Showing {filteredLeaves.length} of{" "}
                                    {leaves.length} requests
                                </small>

                            </div>

                        </div>


                        {/* FILTERS */}

                        <div className="row g-3 mb-4">

                            <div className="col-md-5">

                                <label className="form-label fw-semibold">
                                    Search
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Employee ID, leave type or reason..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />

                            </div>


                            <div className="col-md-3">

                                <label className="form-label fw-semibold">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                >

                                    <option value="ALL">
                                        All Status
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="APPROVED">
                                        Approved
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>

                                </select>

                            </div>


                            <div className="col-md-2">

                                <label className="form-label fw-semibold">
                                    Leave Type
                                </label>

                                <select
                                    className="form-select"
                                    value={leaveTypeFilter}
                                    onChange={(e) =>
                                        setLeaveTypeFilter(e.target.value)
                                    }
                                >

                                    <option value="ALL">
                                        All Types
                                    </option>

                                    {leaveTypes.map(
                                        (type) => (

                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="col-md-2 d-flex align-items-end">

                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>

                            </div>

                        </div>


                        {/* TABLE */}

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-dark">

                                <tr>

                                    <th>ID</th>
                                    <th>Employee ID</th>
                                    <th>Leave Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>

                                </tr>

                                </thead>


                                <tbody>

                                {filteredLeaves.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="text-center py-5"
                                        >

                                            <h5>
                                                No matching leave requests
                                            </h5>

                                            <p className="text-muted mb-0">
                                                Try changing your search
                                                or filters.
                                            </p>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredLeaves.map(
                                        (leave) => (

                                            <tr key={leave.id}>

                                                <td>
                                                    {leave.id}
                                                </td>

                                                <td>
                                                    {leave.employeeId}
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

                                                    {leave.status ===
                                                        "APPROVED" && (

                                                            <span className="badge bg-success">
                                APPROVED
                              </span>

                                                        )}

                                                    {leave.status ===
                                                        "PENDING" && (

                                                            <span className="badge bg-warning text-dark">
                                PENDING
                              </span>

                                                        )}

                                                    {leave.status ===
                                                        "REJECTED" && (

                                                            <span className="badge bg-danger">
                                REJECTED
                              </span>

                                                        )}

                                                </td>


                                                <td>

                                                    {leave.status ===
                                                    "PENDING" ? (

                                                        <div className="d-flex gap-2">

                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                onClick={() =>
                                                                    approveLeave(
                                                                        leave.id
                                                                    )
                                                                }
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                                onClick={() =>
                                                                    rejectLeave(
                                                                        leave.id
                                                                    )
                                                                }
                                                            >
                                                                Reject
                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <span className="text-muted">
                                No action
                              </span>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )

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

export default ManagerDashboard;