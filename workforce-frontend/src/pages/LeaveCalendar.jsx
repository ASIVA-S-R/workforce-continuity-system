import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LeaveCalendar() {
    const navigate = useNavigate();

    const employeeId = 2;

    const [leaves, setLeaves] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD LEAVES
    // =====================================================

    const loadLeaves = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await axios.get(
                `http://localhost:8080/api/employees/${employeeId}/dashboard`
            );

            setLeaves(response.data.leaveHistory || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load leave calendar. Make sure Spring Boot is running."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, []);

    // =====================================================
    // CURRENT MONTH
    // =====================================================

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(
        year,
        month,
        1
    ).getDay();

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const monthName = currentDate.toLocaleString(
        "default",
        {
            month: "long"
        }
    );

    // =====================================================
    // MONTH NAVIGATION
    // =====================================================

    const previousMonth = () => {
        setCurrentDate(
            new Date(
                year,
                month - 1,
                1
            )
        );
    };

    const nextMonth = () => {
        setCurrentDate(
            new Date(
                year,
                month + 1,
                1
            )
        );
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        selectedYear,
        selectedMonth,
        day
    ) => {
        return `${selectedYear}-${String(
            selectedMonth + 1
        ).padStart(2, "0")}-${String(day).padStart(
            2,
            "0"
        )}`;
    };

    // =====================================================
    // GET LEAVES FOR DATE
    // APPROVED + PENDING SHOWN
    // REJECTED HIDDEN
    // =====================================================

    const getLeaveForDate = (day) => {
        const dateString = formatDate(
            year,
            month,
            day
        );

        return leaves.filter((leave) => {
            if (leave.status === "REJECTED") {
                return false;
            }

            if (
                !leave.startDate ||
                !leave.endDate
            ) {
                return false;
            }

            return (
                dateString >= leave.startDate &&
                dateString <= leave.endDate
            );
        });
    };

    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {
        if (status === "APPROVED") {
            return "bg-success text-white";
        }

        if (status === "PENDING") {
            return "bg-warning text-dark";
        }

        return "bg-secondary text-white";
    };

    // =====================================================
    // STATUS ICON
    // =====================================================

    const getStatusIcon = (status) => {
        if (status === "APPROVED") {
            return "✓";
        }

        if (status === "PENDING") {
            return "⏳";
        }

        return "•";
    };

    // =====================================================
    // CHECK TODAY
    // =====================================================

    const isToday = (day) => {
        const today = new Date();

        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };

    // =====================================================
    // SUMMARY
    // =====================================================

    const approvedLeaves = leaves.filter(
        (leave) =>
            leave.status === "APPROVED"
    ).length;

    const pendingLeaves = leaves.filter(
        (leave) =>
            leave.status === "PENDING"
    ).length;

    const rejectedLeaves = leaves.filter(
        (leave) =>
            leave.status === "REJECTED"
    ).length;

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="container mt-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="mt-3">
                    Loading Leave Calendar...
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

                {/* HEADER */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>
                        <h1 className="fw-bold">
                            Leave Calendar
                        </h1>

                        <p className="text-muted mb-0">
                            Employee ID: {employeeId}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => loadLeaves(true)}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Refreshing...
                            </>
                        ) : (
                            <>🔄 Refresh</>
                        )}
                    </button>

                </div>


                {/* NAVIGATION */}

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
                                className="btn btn-primary"
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

                        </div>

                    </div>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="alert alert-danger">

                        <strong>Error:</strong>{" "}
                        {error}

                        <button
                            type="button"
                            className="btn btn-sm btn-danger ms-3"
                            onClick={() =>
                                loadLeaves(true)
                            }
                        >
                            Retry
                        </button>

                    </div>
                )}


                {/* CALENDAR */}

                <div className="card shadow-sm border-0">

                    <div className="card-body">

                        {/* MONTH CONTROLS */}

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={previousMonth}
                            >
                                ← Previous
                            </button>

                            <div className="text-center">

                                <h2 className="fw-bold mb-2">
                                    {monthName} {year}
                                </h2>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={goToToday}
                                >
                                    Today
                                </button>

                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={nextMonth}
                            >
                                Next →
                            </button>

                        </div>


                        {/* CALENDAR */}

                        <div
                            style={{
                                overflowX: "auto"
                            }}
                        >

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(7, minmax(100px, 1fr))",
                                    gap: "5px",
                                    minWidth: "700px"
                                }}
                            >

                                {/* WEEK DAYS */}

                                {[
                                    "Sunday",
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday"
                                ].map((day) => (

                                    <div
                                        key={day}
                                        className="bg-dark text-white text-center fw-bold p-2 rounded"
                                    >
                                        <span className="d-none d-md-inline">
                                            {day}
                                        </span>

                                        <span className="d-md-none">
                                            {day.substring(0, 3)}
                                        </span>
                                    </div>

                                ))}


                                {/* EMPTY CELLS */}

                                {Array.from(
                                    {
                                        length: firstDay
                                    },
                                    (_, index) => (

                                        <div
                                            key={`empty-${index}`}
                                            className="bg-light border rounded"
                                            style={{
                                                minHeight: "150px"
                                            }}
                                        />

                                    )
                                )}


                                {/* DAYS */}

                                {Array.from(
                                    {
                                        length: daysInMonth
                                    },
                                    (_, index) => {

                                        const day =
                                            index + 1;

                                        const dayLeaves =
                                            getLeaveForDate(
                                                day
                                            );

                                        const today =
                                            isToday(day);

                                        const currentDateString =
                                            formatDate(
                                                year,
                                                month,
                                                day
                                            );

                                        return (

                                            <div
                                                key={day}
                                                className={`border rounded p-2 ${
                                                    today
                                                        ? "border-primary border-3"
                                                        : "bg-white"
                                                }`}
                                                style={{
                                                    minHeight:
                                                        "150px",
                                                    overflow:
                                                        "hidden"
                                                }}
                                            >

                                                {/* DATE */}

                                                <div className="d-flex justify-content-between align-items-center mb-2">

                                                    <span
                                                        className={
                                                            today
                                                                ? "badge bg-primary"
                                                                : "fw-bold"
                                                        }
                                                        style={{
                                                            fontSize:
                                                                "16px"
                                                        }}
                                                    >
                                                        {day}
                                                    </span>

                                                    {today && (
                                                        <small className="text-primary fw-bold">
                                                            Today
                                                        </small>
                                                    )}

                                                </div>


                                                {/* LEAVES */}

                                                {dayLeaves.length === 0 ? (

                                                    <small className="text-muted">
                                                        No leave
                                                    </small>

                                                ) : (

                                                    dayLeaves.map(
                                                        (leave) => {

                                                            const isStartDate =
                                                                currentDateString ===
                                                                leave.startDate;

                                                            const isEndDate =
                                                                currentDateString ===
                                                                leave.endDate;

                                                            return (

                                                                <div
                                                                    key={
                                                                        leave.id
                                                                    }
                                                                    className={`rounded p-2 mb-2 ${getStatusClass(
                                                                        leave.status
                                                                    )}`}
                                                                >

                                                                    <div className="fw-bold">
                                                                        {getStatusIcon(
                                                                            leave.status
                                                                        )}{" "}
                                                                        {
                                                                            leave.leaveType
                                                                        }
                                                                    </div>

                                                                    <div className="small fw-bold">
                                                                        {
                                                                            leave.status
                                                                        }
                                                                    </div>

                                                                    <div className="small">
                                                                        Leave #
                                                                        {
                                                                            leave.id
                                                                        }
                                                                    </div>

                                                                    {isStartDate && (
                                                                        <div className="small mt-1">
                                                                            📅 Start
                                                                        </div>
                                                                    )}

                                                                    {isEndDate && (
                                                                        <div className="small">
                                                                            📅 End
                                                                        </div>
                                                                    )}

                                                                    {!isStartDate &&
                                                                        !isEndDate && (
                                                                            <div className="small">
                                                                                • Leave continues
                                                                            </div>
                                                                        )}

                                                                </div>

                                                            );
                                                        }
                                                    )

                                                )}

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </div>

                </div>


                {/* LEGEND */}

                <div className="card shadow-sm border-0 mt-4">

                    <div className="card-body">

                        <h5 className="fw-bold">
                            Leave Status
                        </h5>

                        <div className="d-flex flex-wrap gap-4 mt-3">

                            <div>
                                <span className="badge bg-success">
                                    ✓ APPROVED
                                </span>

                                <small className="ms-2">
                                    Approved leave
                                </small>
                            </div>

                            <div>
                                <span className="badge bg-warning text-dark">
                                    ⏳ PENDING
                                </span>

                                <small className="ms-2">
                                    Waiting for manager
                                </small>
                            </div>

                            <div>
                                <span className="badge bg-danger">
                                    ✕ REJECTED
                                </span>

                                <small className="ms-2">
                                    Rejected leave
                                </small>
                            </div>

                        </div>

                    </div>

                </div>


                {/* SUMMARY */}

                <div className="card shadow-sm border-0 mt-4">

                    <div className="card-body">

                        <h5 className="fw-bold mb-3">
                            Leave Summary
                        </h5>

                        <div className="row g-3">

                            <div className="col-md-4">

                                <div className="border rounded p-3 text-center">

                                    <h6 className="text-muted">
                                        Approved
                                    </h6>

                                    <h3 className="text-success fw-bold">
                                        {approvedLeaves}
                                    </h3>

                                    <small className="text-muted">
                                        Active approved requests
                                    </small>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="border rounded p-3 text-center">

                                    <h6 className="text-muted">
                                        Pending
                                    </h6>

                                    <h3 className="text-warning fw-bold">
                                        {pendingLeaves}
                                    </h3>

                                    <small className="text-muted">
                                        Waiting for manager
                                    </small>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="border rounded p-3 text-center">

                                    <h6 className="text-muted">
                                        Rejected
                                    </h6>

                                    <h3 className="text-danger fw-bold">
                                        {rejectedLeaves}
                                    </h3>

                                    <small className="text-muted">
                                        Not displayed on calendar
                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* NOTE */}

                <div className="alert alert-info mt-4">

                    <strong>Calendar note:</strong>{" "}
                    Approved and pending leaves are displayed
                    on the calendar. Rejected leaves remain
                    available in Leave History but are not shown
                    as active calendar entries.

                </div>

            </div>

        </div>
    );
}

export default LeaveCalendar;