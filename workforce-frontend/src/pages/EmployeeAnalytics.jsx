import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function EmployeeAnalytics() {

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
                "Unable to load employee analytics."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (
            <div className="container mt-5 text-center">

                <div className="spinner-border text-primary"></div>

                <p className="mt-3">
                    Loading Employee Analytics...
                </p>

            </div>
        );
    }


    /* =========================================
       ERROR
    ========================================= */

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


    /* =========================================
       DATA
    ========================================= */

    const employee =
        dashboard?.employee || {};

    const balance =
        dashboard?.leaveBalance || {};

    const history =
        dashboard?.leaveHistory || [];


    /* =========================================
       STATUS COUNTS
    ========================================= */

    const approvedLeaves =
        history.filter(
            leave => leave.status === "APPROVED"
        ).length;

    const pendingLeaves =
        history.filter(
            leave => leave.status === "PENDING"
        ).length;

    const rejectedLeaves =
        history.filter(
            leave => leave.status === "REJECTED"
        ).length;

    const totalRequests =
        history.length;


    /* =========================================
       LEAVE TYPE COUNTS
    ========================================= */

    const sickLeaves =
        history.filter(
            leave => leave.leaveType === "Sick"
        ).length;

    const casualLeaves =
        history.filter(
            leave => leave.leaveType === "Casual"
        ).length;


    /* =========================================
       CHART DATA
    ========================================= */

    const statusChartData = {

        labels: [
            "Approved",
            "Pending",
            "Rejected"
        ],

        datasets: [
            {
                label: "Leave Requests",

                data: [
                    approvedLeaves,
                    pendingLeaves,
                    rejectedLeaves
                ]
            }
        ]
    };


    const statusChartOptions = {

        responsive: true,

        plugins: {

            legend: {
                position: "bottom"
            },

            title: {
                display: true,
                text: "Leave Request Status"
            }

        }

    };


    const typeChartData = {

        labels: [
            "Sick",
            "Casual"
        ],

        datasets: [
            {
                label: "Leave Type",

                data: [
                    sickLeaves,
                    casualLeaves
                ]
            }
        ]

    };


    const typeChartOptions = {

        responsive: true,

        plugins: {

            legend: {
                position: "bottom"
            },

            title: {
                display: true,
                text: "Leave Type Distribution"
            }

        }

    };


    const balanceChartData = {

        labels: [
            "Used Leaves",
            "Remaining Leaves"
        ],

        datasets: [
            {
                label: "Leave Balance",

                data: [
                    balance.usedLeaves || 0,
                    balance.remainingLeaves || 0
                ]
            }
        ]

    };


    const balanceChartOptions = {

        responsive: true,

        plugins: {

            legend: {
                position: "bottom"
            },

            title: {
                display: true,
                text: "Leave Balance"
            }

        }

    };


    /* =========================================
       MONTHLY DATA
    ========================================= */

    const monthlyData = {};

    history.forEach((leave) => {

        if (!leave.startDate) {
            return;
        }

        const month =
            leave.startDate.substring(0, 7);

        monthlyData[month] =
            (monthlyData[month] || 0) + 1;

    });


    const sortedMonths =
        Object.keys(monthlyData).sort();


    const monthlyChartData = {

        labels: sortedMonths.length
            ? sortedMonths
            : ["No Data"],

        datasets: [
            {
                label: "Leave Requests",

                data: sortedMonths.length
                    ? sortedMonths.map(
                        month =>
                            monthlyData[month]
                    )
                    : [0]
            }
        ]

    };


    const monthlyChartOptions = {

        responsive: true,

        plugins: {

            legend: {
                display: false
            },

            title: {
                display: true,
                text: "Monthly Leave Requests"
            }

        }

    };


    /* =========================================
       MAIN PAGE
    ========================================= */

    return (

        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">


                {/* =================================
                    HEADER
                ================================= */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h1 className="fw-bold">
                            Employee Analytics
                        </h1>

                        <p className="text-muted mb-0">
                            Workforce Continuity System
                        </p>

                    </div>


                    <button
                        className="btn btn-outline-primary"
                        onClick={loadDashboard}
                    >
                        ↻ Refresh
                    </button>

                </div>


                {/* =================================
                    NAVIGATION
                ================================= */}

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
                                onClick={() =>
                                    navigate("/apply-leave")
                                }
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
                                Calendar
                            </button>


                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate("/employee-analytics")
                                }
                            >
                                Analytics
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


                {/* =================================
                    EMPLOYEE INFO
                ================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <div className="row align-items-center">

                            <div className="col-md-8">

                                <h4 className="fw-bold mb-1">
                                    {employee.name}
                                </h4>

                                <p className="text-muted mb-1">
                                    Employee ID: {employee.id}
                                </p>

                                <p className="text-muted mb-0">
                                    Department ID:{" "}
                                    {employee.departmentId}
                                </p>

                            </div>


                            <div className="col-md-4 text-md-end mt-3 mt-md-0">

                                <span className="badge bg-primary fs-6">
                                    {employee.role}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================
                    SUMMARY CARDS
                ================================= */}

                <div className="row g-4 mb-4">


                    {/* TOTAL */}

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

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

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Approved
                                </h6>

                                <h2 className="fw-bold text-success">
                                    {approvedLeaves}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Pending
                                </h6>

                                <h2 className="fw-bold text-warning">
                                    {pendingLeaves}
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* REJECTED */}

                    <div className="col-md-3">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body text-center">

                                <h6 className="text-muted">
                                    Rejected
                                </h6>

                                <h2 className="fw-bold text-danger">
                                    {rejectedLeaves}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================
                    BALANCE CARDS
                ================================= */}

                <h3 className="fw-bold mb-3">
                    Leave Balance
                </h3>

                <div className="row g-4 mb-5">


                    <div className="col-md-4">

                        <div className="card shadow-sm border-0 text-center">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Total Leaves
                                </h6>

                                <h2 className="fw-bold">
                                    {balance.totalLeaves || 0}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-4">

                        <div className="card shadow-sm border-0 text-center">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Used Leaves
                                </h6>

                                <h2 className="fw-bold text-danger">
                                    {balance.usedLeaves || 0}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-4">

                        <div className="card shadow-sm border-0 text-center">

                            <div className="card-body">

                                <h6 className="text-muted">
                                    Remaining Leaves
                                </h6>

                                <h2 className="fw-bold text-success">
                                    {balance.remainingLeaves || 0}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================
                    CHARTS ROW 1
                ================================= */}

                <div className="row g-4 mb-4">


                    {/* STATUS CHART */}

                    <div className="col-lg-6">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h4 className="fw-bold mb-4">
                                    Leave Status
                                </h4>

                                <div
                                    style={{
                                        height: "350px"
                                    }}
                                >

                                    <Bar
                                        data={statusChartData}
                                        options={
                                            statusChartOptions
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* TYPE CHART */}

                    <div className="col-lg-6">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h4 className="fw-bold mb-4">
                                    Leave Types
                                </h4>

                                <div
                                    style={{
                                        height: "350px"
                                    }}
                                >

                                    <Doughnut
                                        data={typeChartData}
                                        options={
                                            typeChartOptions
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================
                    CHARTS ROW 2
                ================================= */}

                <div className="row g-4 mb-4">


                    {/* BALANCE CHART */}

                    <div className="col-lg-6">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h4 className="fw-bold mb-4">
                                    Leave Balance Analysis
                                </h4>

                                <div
                                    style={{
                                        height: "350px"
                                    }}
                                >

                                    <Doughnut
                                        data={
                                            balanceChartData
                                        }
                                        options={
                                            balanceChartOptions
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* MONTHLY CHART */}

                    <div className="col-lg-6">

                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body">

                                <h4 className="fw-bold mb-4">
                                    Monthly Leave Requests
                                </h4>

                                <div
                                    style={{
                                        height: "350px"
                                    }}
                                >

                                    <Bar
                                        data={
                                            monthlyChartData
                                        }
                                        options={
                                            monthlyChartOptions
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================
                    INSIGHTS
                ================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <h4 className="fw-bold mb-4">
                            Leave Insights
                        </h4>


                        <div className="row g-3">


                            <div className="col-md-4">

                                <div className="alert alert-success mb-0">

                                    <strong>
                                        Approved Leaves
                                    </strong>

                                    <br />

                                    You have{" "}
                                    <strong>
                                        {approvedLeaves}
                                    </strong>{" "}
                                    approved leave request
                                    {approvedLeaves !== 1
                                        ? "s"
                                        : ""}.

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="alert alert-warning mb-0">

                                    <strong>
                                        Pending Leaves
                                    </strong>

                                    <br />

                                    You have{" "}
                                    <strong>
                                        {pendingLeaves}
                                    </strong>{" "}
                                    request
                                    {pendingLeaves !== 1
                                        ? "s"
                                        : ""} waiting for
                                    manager action.

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div className="alert alert-info mb-0">

                                    <strong>
                                        Remaining Balance
                                    </strong>

                                    <br />

                                    You have{" "}
                                    <strong>
                                        {balance.remainingLeaves ||
                                            0}
                                    </strong>{" "}
                                    leave
                                    {balance.remainingLeaves !==
                                    1
                                        ? "s"
                                        : ""} remaining.

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================
                    QUICK ACTIONS
                ================================= */}

                <div className="card shadow-sm border-0">

                    <div className="card-body">

                        <h4 className="fw-bold mb-3">
                            Quick Actions
                        </h4>

                        <div className="d-flex flex-wrap gap-2">

                            <button
                                className="btn btn-success"
                                onClick={() =>
                                    navigate(
                                        "/apply-leave"
                                    )
                                }
                            >
                                + Apply New Leave
                            </button>


                            <button
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    navigate(
                                        "/leave-calendar"
                                    )
                                }
                            >
                                View Calendar
                            </button>


                            <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    navigate(
                                        "/leave-history"
                                    )
                                }
                            >
                                View Leave History
                            </button>


                            <button
                                className="btn btn-outline-dark"
                                onClick={() =>
                                    navigate(
                                        "/employee"
                                    )
                                }
                            >
                                Back to Dashboard
                            </button>

                        </div>

                    </div>

                </div>


            </div>

        </div>
    );
}

export default EmployeeAnalytics;