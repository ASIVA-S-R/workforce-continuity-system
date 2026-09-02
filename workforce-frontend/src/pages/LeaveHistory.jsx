import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LeaveHistory() {

    const navigate = useNavigate();

    const employeeId = 2;

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");


    // =====================================================
    // LOAD LEAVE HISTORY
    // =====================================================

    const loadLeaveHistory = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axios.get(
                `http://localhost:8080/api/employees/${employeeId}/dashboard`
            );

            setLeaves(response.data.leaveHistory || []);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load leave history. Make sure Spring Boot is running."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadLeaveHistory();
    }, []);


    // =====================================================
    // STATUS BADGE
    // =====================================================

    const getStatusBadge = (status) => {

        if (status === "APPROVED") {

            return (
                <span className="badge bg-success px-3 py-2">
                    ✓ APPROVED
                </span>
            );

        }

        if (status === "REJECTED") {

            return (
                <span className="badge bg-danger px-3 py-2">
                    ✕ REJECTED
                </span>
            );

        }

        return (
            <span className="badge bg-warning text-dark px-3 py-2">
                ⏳ PENDING
            </span>
        );
    };


    // =====================================================
    // DYNAMIC LEAVE TYPES
    // =====================================================

    const leaveTypes = [
        ...new Set(
            leaves
                .map((leave) => leave.leaveType)
                .filter(Boolean)
        )
    ];


    // =====================================================
    // FILTER LEAVES
    // =====================================================

    const filteredLeaves = leaves.filter((leave) => {

        const searchText = search
            .toLowerCase()
            .trim();

        const matchesSearch =
            searchText === "" ||
            String(leave.id)
                .toLowerCase()
                .includes(searchText) ||
            String(leave.leaveType)
                .toLowerCase()
                .includes(searchText) ||
            String(leave.reason)
                .toLowerCase()
                .includes(searchText) ||
            String(leave.startDate)
                .toLowerCase()
                .includes(searchText) ||
            String(leave.endDate)
                .toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "ALL" ||
            leave.status === statusFilter;

        const matchesType =
            typeFilter === "ALL" ||
            leave.leaveType === typeFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesType
        );

    });


    // =====================================================
    // SUMMARY
    // =====================================================

    const totalRequests = leaves.length;

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
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = () => {

        setSearch("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="container mt-5 text-center">

                <div className="spinner-border text-primary"></div>

                <p className="mt-3">
                    Loading Leave History...
                </p>

            </div>

        );

    }


    // =====================================================
    // PAGE
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
                            Leave History
                        </h1>

                        <p className="text-muted mb-0">
                            Employee ID: {employeeId}
                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={loadLeaveHistory}
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
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate("/leave-history")
                                }
                            >
                                Leave History
                            </button>


                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    navigate("/leave-calendar")
                                }
                            >
                                Calendar
                            </button>


                            <button
                                type="button"
                                className="btn btn-outline-dark"
                                onClick={() =>
                                    navigate("/employee-profile")
                                }
                            >
                                Profile
                            </button>


                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                Home
                            </button>


                            <button
                                type="button"
                                className="btn btn-dark"
                                onClick={() =>
                                    navigate("/manager")
                                }
                            >
                                Manager
                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="alert alert-danger">

                        <strong>
                            Error:
                        </strong>{" "}

                        {error}

                    </div>

                )}


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="row g-4 mb-4">


                    {/* TOTAL */}

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 text-center h-100">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Total Requests
                                </h6>

                                <h2 className="fw-bold">
                                    {totalRequests}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* APPROVED */}

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 text-center h-100">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Approved
                                </h6>

                                <h2 className="fw-bold text-success">
                                    {approvedCount}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 text-center h-100">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Pending
                                </h6>

                                <h2 className="fw-bold text-warning">
                                    {pendingCount}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* REJECTED */}

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 text-center h-100">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Rejected
                                </h6>

                                <h2 className="fw-bold text-danger">
                                    {rejectedCount}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SEARCH AND FILTERS
                ================================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <div className="row g-3">


                            {/* SEARCH */}

                            <div className="col-lg-5 col-md-12">

                                <label className="form-label fw-bold">
                                    Search
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search ID, leave type, date or reason..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />

                            </div>


                            {/* STATUS */}

                            <div className="col-lg-3 col-md-4">

                                <label className="form-label fw-bold">
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


                            {/* TYPE */}

                            <div className="col-lg-2 col-md-4">

                                <label className="form-label fw-bold">
                                    Leave Type
                                </label>

                                <select
                                    className="form-select"
                                    value={typeFilter}
                                    onChange={(e) =>
                                        setTypeFilter(e.target.value)
                                    }
                                >

                                    <option value="ALL">
                                        All Types
                                    </option>

                                    {leaveTypes.map((type) => (

                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* CLEAR */}

                            <div className="col-lg-2 col-md-4 d-flex align-items-end">

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RESULT COUNT
                ================================================= */}

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <div>

                        <strong>
                            Showing {filteredLeaves.length} of{" "}
                            {leaves.length} requests
                        </strong>

                    </div>

                    {(search ||
                        statusFilter !== "ALL" ||
                        typeFilter !== "ALL") && (

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={clearFilters}
                        >
                            Reset Filters
                        </button>

                    )}

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="card shadow-sm border-0">

                    <div className="card-body">

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-dark">

                                <tr>

                                    <th>ID</th>

                                    <th>Leave Type</th>

                                    <th>Start Date</th>

                                    <th>End Date</th>

                                    <th>Reason</th>

                                    <th>Status</th>

                                </tr>

                                </thead>


                                <tbody>

                                {filteredLeaves.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center py-5"
                                        >

                                            <div
                                                style={{
                                                    fontSize: "40px"
                                                }}
                                            >
                                                📋
                                            </div>

                                            <h5 className="mt-2">
                                                No leave requests found
                                            </h5>

                                            <p className="text-muted mb-3">
                                                Try changing your search
                                                or filters.
                                            </p>

                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={clearFilters}
                                            >
                                                Clear Filters
                                            </button>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredLeaves.map((leave) => (

                                        <tr key={leave.id}>


                                            {/* ID */}

                                            <td className="fw-bold">
                                                #{leave.id}
                                            </td>


                                            {/* TYPE */}

                                            <td>

                                                <span className="badge bg-primary">
                                                    {leave.leaveType}
                                                </span>

                                            </td>


                                            {/* START */}

                                            <td>
                                                {leave.startDate}
                                            </td>


                                            {/* END */}

                                            <td>
                                                {leave.endDate}
                                            </td>


                                            {/* REASON */}

                                            <td>
                                                {leave.reason}
                                            </td>


                                            {/* STATUS */}

                                            <td>
                                                {getStatusBadge(
                                                    leave.status
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


                {/* =================================================
                    FOOTER NAVIGATION
                ================================================= */}

                <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                            navigate("/apply-leave")
                        }
                    >
                        + Apply New Leave
                    </button>


                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() =>
                            navigate("/leave-calendar")
                        }
                    >
                        📅 View Calendar
                    </button>


                    <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={() =>
                            navigate("/employee")
                        }
                    >
                        Employee Dashboard
                    </button>

                </div>

            </div>

        </div>

    );
}

export default LeaveHistory;