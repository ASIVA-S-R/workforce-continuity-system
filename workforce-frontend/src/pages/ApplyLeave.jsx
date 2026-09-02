import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ApplyLeave() {

    const navigate = useNavigate();

    const employeeId = 2;

    const [leaveType, setLeaveType] = useState("Casual");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    const [balance, setBalance] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loadingBalance, setLoadingBalance] = useState(true);
    const [submitting, setSubmitting] = useState(false);


    // =====================================================
    // GET LEAVE BALANCE
    // =====================================================

    const loadBalance = async () => {

        try {

            setLoadingBalance(true);

            const response = await axios.get(
                `http://localhost:8080/api/leave-balances/${employeeId}`
            );

            setBalance(response.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoadingBalance(false);

        }
    };


    useEffect(() => {
        loadBalance();
    }, []);


    // =====================================================
    // TODAY
    // =====================================================

    const today = new Date()
        .toISOString()
        .split("T")[0];


    // =====================================================
    // SUBMIT LEAVE
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        // BASIC VALIDATION

        if (!startDate || !endDate || !reason.trim()) {

            setError(
                "Please fill in all required fields."
            );

            return;
        }


        // DATE VALIDATION

        if (startDate < today) {

            setError(
                "Start date cannot be in the past."
            );

            return;
        }


        if (endDate < startDate) {

            setError(
                "End date cannot be before start date."
            );

            return;
        }


        // CALCULATE NUMBER OF DAYS

        const start = new Date(startDate);
        const end = new Date(endDate);

        const difference =
            end.getTime() - start.getTime();

        const numberOfDays =
            Math.floor(
                difference / (1000 * 60 * 60 * 24)
            ) + 1;


        // CHECK BALANCE

        if (
            balance &&
            numberOfDays > balance.remainingLeaves
        ) {

            setError(
                `Insufficient leave balance. You have only ${balance.remainingLeaves} leave(s) remaining.`
            );

            return;
        }


        try {

            setSubmitting(true);

            const response = await axios.post(
                "http://localhost:8080/api/leaves",
                {
                    employeeId: employeeId,
                    leaveType: leaveType,
                    startDate: startDate,
                    endDate: endDate,
                    reason: reason.trim()
                }
            );


            console.log(
                "Leave created:",
                response.data
            );


            // SUCCESS MESSAGE

            setMessage(
                "Leave applied successfully! Your request is now pending manager approval."
            );


            // CLEAR FORM

            setStartDate("");
            setEndDate("");
            setReason("");


            // REFRESH BALANCE

            await loadBalance();


        } catch (err) {

            console.error(err);


            if (err.response?.data) {

                const backendMessage =
                    err.response.data.message ||
                    err.response.data.error;

                setError(
                    backendMessage ||
                    "Failed to apply leave."
                );

            } else {

                setError(
                    "Unable to connect to the server. Make sure Spring Boot is running."
                );

            }

        } finally {

            setSubmitting(false);

        }

    };


    return (

        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h1 className="fw-bold">
                            Apply for Leave
                        </h1>

                        <p className="text-muted mb-0">
                            Employee ID: {employeeId}
                        </p>

                    </div>


                    <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                            navigate("/employee")
                        }
                    >
                        Dashboard
                    </button>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <div className="d-flex flex-wrap gap-2">

                            <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    navigate("/employee")
                                }
                            >
                                Dashboard
                            </button>


                            <button
                                className="btn btn-success"
                            >
                                Apply Leave
                            </button>


                            <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    navigate("/leave-history")
                                }
                            >
                                Leave History
                            </button>


                            <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    navigate("/leave-calendar")
                                }
                            >
                                Leave Calendar
                            </button>


                            <button
                                className="btn btn-outline-dark"
                                onClick={() =>
                                    navigate("/employee-profile")
                                }
                            >
                                My Profile
                            </button>

                        </div>

                    </div>

                </div>


                <div className="row g-4">


                    {/* =================================================
                        LEAVE BALANCE
                    ================================================= */}

                    <div className="col-lg-4">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h4 className="fw-bold mb-4">
                                    Leave Balance
                                </h4>


                                {loadingBalance ? (

                                    <div className="text-center py-4">

                                        <div className="spinner-border text-primary"></div>

                                        <p className="mt-2 text-muted">
                                            Loading balance...
                                        </p>

                                    </div>

                                ) : balance ? (

                                    <>

                                        <div className="text-center mb-4">

                                            <div
                                                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto"
                                                style={{
                                                    width: "120px",
                                                    height: "120px"
                                                }}
                                            >

                                                <div>

                                                    <h1 className="fw-bold mb-0">
                                                        {balance.remainingLeaves}
                                                    </h1>

                                                    <small>
                                                        Remaining
                                                    </small>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="row g-3">

                                            <div className="col-6">

                                                <div className="bg-light rounded p-3 text-center">

                                                    <small className="text-muted">
                                                        Total
                                                    </small>

                                                    <h4 className="fw-bold mb-0">
                                                        {balance.totalLeaves}
                                                    </h4>

                                                </div>

                                            </div>


                                            <div className="col-6">

                                                <div className="bg-light rounded p-3 text-center">

                                                    <small className="text-muted">
                                                        Used
                                                    </small>

                                                    <h4 className="fw-bold text-danger mb-0">
                                                        {balance.usedLeaves}
                                                    </h4>

                                                </div>

                                            </div>

                                        </div>

                                    </>

                                ) : (

                                    <div className="alert alert-warning">

                                        Leave balance could not be loaded.

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        APPLY FORM
                    ================================================= */}

                    <div className="col-lg-8">

                        <div className="card shadow-sm border-0">

                            <div className="card-body p-4">

                                <h3 className="fw-bold mb-4">
                                    Leave Request
                                </h3>


                                {/* SUCCESS */}

                                {message && (

                                    <div className="alert alert-success">

                                        <strong>
                                            ✓ Success
                                        </strong>

                                        <br />

                                        {message}

                                    </div>

                                )}


                                {/* ERROR */}

                                {error && (

                                    <div className="alert alert-danger">

                                        <strong>
                                            ✕ Error
                                        </strong>

                                        <br />

                                        {error}

                                    </div>

                                )}


                                <form onSubmit={handleSubmit}>


                                    {/* LEAVE TYPE */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Leave Type
                                        </label>

                                        <select
                                            className="form-select"
                                            value={leaveType}
                                            onChange={(e) =>
                                                setLeaveType(
                                                    e.target.value
                                                )
                                            }
                                            disabled={submitting}
                                        >

                                            <option value="Casual">
                                                Casual
                                            </option>

                                            <option value="Sick">
                                                Sick
                                            </option>

                                            <option value="Emergency">
                                                Emergency
                                            </option>

                                        </select>

                                    </div>


                                    {/* DATES */}

                                    <div className="row">


                                        {/* START */}

                                        <div className="col-md-6 mb-4">

                                            <label className="form-label fw-semibold">
                                                Start Date
                                            </label>

                                            <input
                                                type="date"
                                                className="form-control"
                                                min={today}
                                                value={startDate}
                                                onChange={(e) => {

                                                    setStartDate(
                                                        e.target.value
                                                    );

                                                    if (
                                                        endDate &&
                                                        e.target.value >
                                                        endDate
                                                    ) {

                                                        setEndDate("");

                                                    }

                                                }}
                                                disabled={submitting}
                                            />

                                        </div>


                                        {/* END */}

                                        <div className="col-md-6 mb-4">

                                            <label className="form-label fw-semibold">
                                                End Date
                                            </label>

                                            <input
                                                type="date"
                                                className="form-control"
                                                min={
                                                    startDate ||
                                                    today
                                                }
                                                value={endDate}
                                                onChange={(e) =>
                                                    setEndDate(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={submitting}
                                            />

                                        </div>

                                    </div>


                                    {/* REASON */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Reason
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={reason}
                                            onChange={(e) =>
                                                setReason(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter the reason for your leave..."
                                            disabled={submitting}
                                        />

                                    </div>


                                    {/* SELECTED DAYS */}

                                    {startDate &&
                                        endDate &&
                                        endDate >= startDate && (

                                            <div className="alert alert-info">

                                                <strong>
                                                    Leave Duration:
                                                </strong>{" "}

                                                {Math.floor(
                                                    (
                                                        new Date(endDate) -
                                                        new Date(startDate)
                                                    ) /
                                                    (1000 *
                                                        60 *
                                                        60 *
                                                        24)
                                                ) + 1}{" "}

                                                day(s)

                                            </div>

                                        )}


                                    {/* SUBMIT */}

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={submitting}
                                    >

                                        {submitting ? (

                                            <>

                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                ></span>

                                                Applying...

                                            </>

                                        ) : (

                                            <>
                                                Apply Leave
                                            </>

                                        )}

                                    </button>


                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-lg ms-2"
                                        onClick={() => {

                                            setStartDate("");
                                            setEndDate("");
                                            setReason("");
                                            setMessage("");
                                            setError("");

                                        }}
                                        disabled={submitting}
                                    >
                                        Clear
                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    AFTER SUBMISSION NAVIGATION
                ================================================= */}

                {message && (

                    <div className="card shadow-sm border-0 mt-4">

                        <div className="card-body text-center">

                            <h5 className="fw-bold">
                                What would you like to do next?
                            </h5>

                            <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">

                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate("/leave-history")
                                    }
                                >
                                    View Leave History
                                </button>


                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() =>
                                        navigate("/leave-calendar")
                                    }
                                >
                                    View Calendar
                                </button>


                                <button
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

                )}

            </div>

        </div>

    );
}

export default ApplyLeave;