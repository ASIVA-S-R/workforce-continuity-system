import React, { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL;

console.log("API URL:", API);
// =========================================================
// APP
// =========================================================

function App() {
    const [page, setPage] = useState("dashboard");

    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [replacements, setReplacements] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [dashboard, setDashboard] = useState({});

    const [showEmployee, setShowEmployee] = useState(false);
    const [showLeave, setShowLeave] = useState(false);

    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth()
    );

    const [selectedYear, setSelectedYear] = useState(
        new Date().getFullYear()
    );

    const [employeeForm, setEmployeeForm] = useState({
        name: "",
        email: "",
        role: "",
        department: "IT",
        status: "Available",
        workload: 5,
    });

    const [leaveForm, setLeaveForm] = useState({
        employeeId: "",
        leaveType: "Casual",
        startDate: "",
        endDate: "",
        reason: "",
    });

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadAll();
    }, []);

    async function request(url, options = {}) {
        const response = await fetch(API + url, options);

        if (!response.ok) {
            let errorText = "Request failed";

            try {
                const data = await response.json();

                errorText =
                    data.message ||
                    data.error ||
                    errorText;
            } catch {
                // Ignore JSON error
            }

            throw new Error(errorText);
        }

        return response.json();
    }

    async function loadAll() {
        setLoading(true);

        try {
            const [
                dashboardData,
                employeesData,
                leavesData,
                replacementsData,
                notificationsData,
            ] = await Promise.all([
                request("/dashboard"),
                request("/employees"),
                request("/leaves"),
                request("/replacements"),
                request("/notifications"),
            ]);

            setDashboard(dashboardData || {});

            setEmployees(
                Array.isArray(employeesData)
                    ? employeesData
                    : []
            );

            setLeaves(
                Array.isArray(leavesData)
                    ? leavesData
                    : []
            );

            setReplacements(
                Array.isArray(replacementsData)
                    ? replacementsData
                    : []
            );

            setNotifications(
                Array.isArray(notificationsData)
                    ? notificationsData
                    : []
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "Cannot connect to backend. Make sure Spring Boot is running on port 8080."
            );
        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // EMPLOYEE
    // =====================================================

    async function addEmployee(event) {
        event.preventDefault();

        try {
            const newEmployee = {
                name: employeeForm.name.trim(),
                email: employeeForm.email.trim(),
                role: employeeForm.role.trim(),
                department: employeeForm.department,
                status: "Available",
                workload: Number(employeeForm.workload),
            };

            if (
                !newEmployee.name ||
                !newEmployee.email ||
                !newEmployee.role
            ) {
                setMessage(
                    "Please fill all employee details."
                );
                return;
            }

            await request("/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newEmployee),
            });

            setEmployeeForm({
                name: "",
                email: "",
                role: "",
                department: "IT",
                status: "Available",
                workload: 5,
            });

            setShowEmployee(false);

            await loadAll();

            setMessage(
                "Employee added successfully."
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "Failed to add employee: " +
                error.message
            );
        }
    }

    async function deleteEmployee(id) {
        const employee = employees.find(
            (e) => Number(e.id) === Number(id)
        );

        if (
            !window.confirm(
                `Delete ${
                    employee?.name ||
                    "this employee"
                }?`
            )
        ) {
            return;
        }

        try {
            await request(`/employees/${id}`, {
                method: "DELETE",
            });

            await loadAll();

            setMessage(
                "Employee deleted successfully."
            );
        } catch (error) {
            setMessage(
                "Failed to delete employee: " +
                error.message
            );
        }
    }

    // =====================================================
    // LEAVE
    // =====================================================

    async function applyLeave(event) {
        event.preventDefault();

        try {
            if (!leaveForm.employeeId) {
                setMessage(
                    "Please select an employee."
                );
                return;
            }

            if (
                !leaveForm.startDate ||
                !leaveForm.endDate
            ) {
                setMessage(
                    "Please select leave dates."
                );
                return;
            }

            if (
                new Date(leaveForm.endDate) <
                new Date(leaveForm.startDate)
            ) {
                setMessage(
                    "End date cannot be before start date."
                );
                return;
            }

            const leaveData = {
                employeeId: Number(
                    leaveForm.employeeId
                ),
                leaveType:
                leaveForm.leaveType,
                startDate:
                leaveForm.startDate,
                endDate:
                leaveForm.endDate,
                reason:
                    leaveForm.reason.trim(),
                status: "PENDING",
            };

            await request("/leaves", {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    leaveData
                ),
            });

            setLeaveForm({
                employeeId:
                    employees.length > 0
                        ? String(
                            employees[0].id
                        )
                        : "",
                leaveType: "Casual",
                startDate: "",
                endDate: "",
                reason: "",
            });

            setShowLeave(false);

            await loadAll();

            setPage("calendar");

            setMessage(
                "Leave applied successfully."
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "Failed to apply leave: " +
                error.message
            );
        }
    }

    async function updateLeave(id, action) {
        try {
            await request(
                `/leaves/${id}/${action}`,
                {
                    method: "PUT",
                }
            );

            await loadAll();

            setMessage(
                action === "approve"
                    ? "Leave approved successfully."
                    : "Leave rejected successfully."
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "Failed to update leave: " +
                error.message
            );
        }
    }

    // =====================================================
    // REPLACEMENT
    // =====================================================

    async function getReplacementSuggestions(
        employeeId
    ) {
        try {
            const suggestions =
                await request(
                    `/replacement/suggestions/${employeeId}`
                );

            return Array.isArray(
                suggestions
            )
                ? suggestions
                : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async function assignReplacement(
        employeeId,
        replacementEmployeeId
    ) {
        try {
            if (!replacementEmployeeId) {
                setMessage(
                    "Please select a replacement employee."
                );
                return;
            }

            await request("/replacement", {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    employeeId:
                        Number(employeeId),
                    replacementEmployeeId:
                        Number(
                            replacementEmployeeId
                        ),
                }),
            });

            await loadAll();

            setMessage(
                "Replacement assigned successfully."
            );
        } catch (error) {
            console.error(error);

            setMessage(
                "Failed to assign replacement: " +
                error.message
            );
        }
    }

    // =====================================================
    // HELPERS
    // =====================================================

    function employeeName(id) {
        const employee = employees.find(
            (e) =>
                Number(e.id) === Number(id)
        );

        return employee
            ? employee.name
            : `Employee #${id}`;
    }

    const filteredEmployees = useMemo(() => {
        const value =
            search.toLowerCase();

        return employees.filter(
            (employee) =>
                [
                    employee.name,
                    employee.email,
                    employee.role,
                    employee.department,
                    employee.status,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(value)
        );
    }, [employees, search]);

    // =====================================================
    // CALENDAR
    // =====================================================

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const weekDays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
    ];

    function previousMonth() {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(
                selectedYear - 1
            );
        } else {
            setSelectedMonth(
                selectedMonth - 1
            );
        }
    }

    function nextMonth() {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(
                selectedYear + 1
            );
        } else {
            setSelectedMonth(
                selectedMonth + 1
            );
        }
    }

    function goToCurrentMonth() {
        const now = new Date();

        setSelectedMonth(
            now.getMonth()
        );

        setSelectedYear(
            now.getFullYear()
        );
    }

    function parseDate(dateString) {
        if (!dateString) return null;

        const parts =
            String(dateString).split(
                "-"
            );

        if (parts.length !== 3) {
            return null;
        }

        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        if (!year || !month || !day) {
            return null;
        }

        return new Date(
            year,
            month - 1,
            day
        );
    }

    function leavesForDay(dayDate) {
        return leaves.filter((leave) => {
            const start = parseDate(
                leave.startDate
            );

            const end = parseDate(
                leave.endDate
            );

            if (!start || !end) {
                return false;
            }

            const current = new Date(
                dayDate.getFullYear(),
                dayDate.getMonth(),
                dayDate.getDate()
            );

            const startDay = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate()
            );

            const endDay = new Date(
                end.getFullYear(),
                end.getMonth(),
                end.getDate()
            );

            return (
                current >= startDay &&
                current <= endDay
            );
        });
    }

    function buildCalendarDays() {
        const firstDay = new Date(
            selectedYear,
            selectedMonth,
            1
        );

        const lastDay = new Date(
            selectedYear,
            selectedMonth + 1,
            0
        );

        const days = [];

        const firstWeekDay =
            firstDay.getDay();

        for (
            let i = 0;
            i < firstWeekDay;
            i++
        ) {
            days.push(null);
        }

        for (
            let day = 1;
            day <= lastDay.getDate();
            day++
        ) {
            days.push(
                new Date(
                    selectedYear,
                    selectedMonth,
                    day
                )
            );
        }

        return days;
    }

    const calendarDays =
        buildCalendarDays();

    const calendarPending =
        leaves.filter(
            (leave) =>
                String(
                    leave.status
                ).toUpperCase() ===
                "PENDING"
        ).length;

    const calendarApproved =
        leaves.filter(
            (leave) =>
                String(
                    leave.status
                ).toUpperCase() ===
                "APPROVED"
        ).length;

    const calendarRejected =
        leaves.filter(
            (leave) =>
                String(
                    leave.status
                ).toUpperCase() ===
                "REJECTED"
        ).length;

    // =====================================================
    // DASHBOARD
    // =====================================================

    function DashboardPage() {
        return (
            <>
                <div className="header-row">
                    <div className="page-title">
                        <h1>
                            Workforce Dashboard
                        </h1>

                        <p>
                            Manage employees,
                            leave requests and
                            workforce continuity.
                        </p>
                    </div>

                    <div className="actions">
                        <button
                            className="btn primary"
                            onClick={() =>
                                setShowEmployee(
                                    true
                                )
                            }
                        >
                            + Add Employee
                        </button>

                        <button
                            className="btn success"
                            onClick={() =>
                                setShowLeave(
                                    true
                                )
                            }
                        >
                            + Apply Leave
                        </button>
                    </div>
                </div>

                <div className="cards">
                    <StatCard
                        title="👥 Total Employees"
                        value={
                            dashboard.totalEmployees ??
                            employees.length
                        }
                    />

                    <StatCard
                        title="⏳ Pending Leaves"
                        value={
                            dashboard.pendingLeaves ??
                            leaves.filter(
                                (l) =>
                                    String(
                                        l.status
                                    ).toUpperCase() ===
                                    "PENDING"
                            ).length
                        }
                    />

                    <StatCard
                        title="✓ Approved Leaves"
                        value={
                            dashboard.approvedLeaves ??
                            leaves.filter(
                                (l) =>
                                    String(
                                        l.status
                                    ).toUpperCase() ===
                                    "APPROVED"
                            ).length
                        }
                    />

                    <StatCard
                        title="✕ Rejected Leaves"
                        value={
                            dashboard.rejectedLeaves ??
                            leaves.filter(
                                (l) =>
                                    String(
                                        l.status
                                    ).toUpperCase() ===
                                    "REJECTED"
                            ).length
                        }
                    />

                    <StatCard
                        title="⚡ Continuity"
                        value={`${dashboard.continuityScore ?? 0}%`}
                    />
                </div>

                <div className="panel">
                    <div className="header-row">
                        <h2>Employees</h2>

                        <button
                            className="btn light"
                            onClick={loadAll}
                        >
                            {loading
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>
                    </div>

                    <input
                        placeholder="Search employee, email, role..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    <EmployeeTable
                        data={
                            filteredEmployees
                        }
                        showActions={false}
                    />
                </div>
            </>
        );
    }

    // =====================================================
    // EMPLOYEES
    // =====================================================

    function EmployeesPage() {
        return (
            <div className="panel">
                <div className="header-row">
                    <h1>
                        Employee Management
                    </h1>

                    <button
                        className="btn primary"
                        onClick={() =>
                            setShowEmployee(
                                true
                            )
                        }
                    >
                        + Add Employee
                    </button>
                </div>

                <input
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <EmployeeTable
                    data={filteredEmployees}
                    showActions={true}
                />
            </div>
        );
    }

    // =====================================================
    // LEAVES
    // =====================================================

    function LeavesPage() {
        return (
            <div className="panel">
                <div className="header-row">
                    <h1>
                        Leave Management
                    </h1>

                    <button
                        className="btn primary"
                        onClick={() =>
                            setShowLeave(
                                true
                            )
                        }
                    >
                        + Apply Leave
                    </button>
                </div>

                {leaves.length === 0 ? (
                    <div className="empty">
                        No leave requests
                        available.
                    </div>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>
                                Employee
                            </th>
                            <th>
                                Type
                            </th>
                            <th>
                                Dates
                            </th>
                            <th>
                                Reason
                            </th>
                            <th>
                                Status
                            </th>
                            <th>
                                Action
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {leaves.map(
                            (leave) => {
                                const status =
                                    String(
                                        leave.status ||
                                        "PENDING"
                                    ).toUpperCase();

                                return (
                                    <tr
                                        key={
                                            leave.id
                                        }
                                    >
                                        <td>
                                            #
                                            {
                                                leave.id
                                            }
                                        </td>

                                        <td>
                                            {
                                                employeeName(
                                                    leave.employeeId
                                                )
                                            }
                                        </td>

                                        <td>
                                            {
                                                leave.leaveType
                                            }
                                        </td>

                                        <td>
                                            {
                                                leave.startDate
                                            }
                                            {" → "}
                                            {
                                                leave.endDate
                                            }
                                        </td>

                                        <td>
                                            {
                                                leave.reason
                                            }
                                        </td>

                                        <td>
                                                <span
                                                    className={`badge ${status.toLowerCase()}`}
                                                >
                                                    {
                                                        status
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            {status ===
                                                "PENDING" && (
                                                    <div className="actions">
                                                        <button
                                                            className="btn success"
                                                            onClick={() =>
                                                                updateLeave(
                                                                    leave.id,
                                                                    "approve"
                                                                )
                                                            }
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            className="btn danger"
                                                            onClick={() =>
                                                                updateLeave(
                                                                    leave.id,
                                                                    "reject"
                                                                )
                                                            }
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        );
    }

    // =====================================================
    // CALENDAR
    // =====================================================

    function CalendarPage() {
        return (
            <div className="panel calendar-panel">
                <div className="header-row">
                    <div>
                        <h1>
                            Leave Calendar
                        </h1>

                        <p>
                            All employee leave
                            activity.
                        </p>
                    </div>

                    <button
                        className="btn success"
                        onClick={() =>
                            setShowLeave(
                                true
                            )
                        }
                    >
                        + Apply Leave
                    </button>
                </div>

                <div className="calendar-stats">
                    <span className="stat-pill stat-pending">
                        ⏳ Pending:{" "}
                        {calendarPending}
                    </span>

                    <span className="stat-pill stat-approved">
                        ✓ Approved:{" "}
                        {calendarApproved}
                    </span>

                    <span className="stat-pill stat-rejected">
                        ✕ Rejected:{" "}
                        {calendarRejected}
                    </span>

                    <span className="stat-pill light">
                        Total:{" "}
                        {leaves.length}
                    </span>
                </div>

                <div className="calendar-toolbar">
                    <div className="actions">
                        <button
                            className="btn light"
                            onClick={
                                previousMonth
                            }
                        >
                            ← Previous
                        </button>

                        <button
                            className="btn primary"
                            onClick={
                                goToCurrentMonth
                            }
                        >
                            Today
                        </button>

                        <button
                            className="btn light"
                            onClick={nextMonth}
                        >
                            Next →
                        </button>
                    </div>

                    <div className="month-title">
                        {
                            monthNames[
                                selectedMonth
                                ]
                        }{" "}
                        {selectedYear}
                    </div>

                    <button
                        className="btn secondary"
                        onClick={loadAll}
                    >
                        🔄 Refresh
                    </button>
                </div>

                <div className="calendar-week">
                    {weekDays.map((day) => (
                        <div
                            className="weekday"
                            key={day}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="calendar-grid">
                    {calendarDays.map(
                        (day, index) => {
                            if (!day) {
                                return (
                                    <div
                                        className="calendar-day empty-day"
                                        key={`empty-${index}`}
                                    />
                                );
                            }

                            const events =
                                leavesForDay(
                                    day
                                );

                            const today =
                                new Date();

                            const isToday =
                                day.getDate() ===
                                today.getDate() &&
                                day.getMonth() ===
                                today.getMonth() &&
                                day.getFullYear() ===
                                today.getFullYear();

                            return (
                                <div
                                    className={`calendar-day ${
                                        isToday
                                            ? "today"
                                            : ""
                                    }`}
                                    key={`${selectedYear}-${selectedMonth}-${day.getDate()}`}
                                >
                                    <div className="day-number">
                                        {
                                            day.getDate()
                                        }
                                        {isToday &&
                                            " • Today"}
                                    </div>

                                    {events.map(
                                        (
                                            leave
                                        ) => {
                                            const status =
                                                String(
                                                    leave.status ||
                                                    "PENDING"
                                                ).toLowerCase();

                                            return (
                                                <div
                                                    key={
                                                        leave.id
                                                    }
                                                    className={`leave-event ${status}`}
                                                >
                                                    <div className="event-name">
                                                        {employeeName(
                                                            leave.employeeId
                                                        )}
                                                    </div>

                                                    <div className="event-type">
                                                        {
                                                            leave.leaveType
                                                        }
                                                    </div>

                                                    <div>
                                                        {
                                                            leave.startDate
                                                        }
                                                        {" → "}
                                                        {
                                                            leave.endDate
                                                        }
                                                    </div>

                                                    <strong>
                                                        {String(
                                                            leave.status ||
                                                            "PENDING"
                                                        ).toUpperCase()}
                                                    </strong>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            </div>
        );
    }

    // =====================================================
    // ANALYTICS
    // =====================================================

    function AnalyticsPage() {
        const total =
            employees.length;

        const available =
            employees.filter(
                (e) =>
                    e.status ===
                    "Available"
            ).length;

        const onLeave =
            employees.filter(
                (e) =>
                    e.status ===
                    "On Leave"
            ).length;

        const pending =
            leaves.filter(
                (l) =>
                    String(
                        l.status
                    ).toUpperCase() ===
                    "PENDING"
            ).length;

        const approved =
            leaves.filter(
                (l) =>
                    String(
                        l.status
                    ).toUpperCase() ===
                    "APPROVED"
            ).length;

        const rejected =
            leaves.filter(
                (l) =>
                    String(
                        l.status
                    ).toUpperCase() ===
                    "REJECTED"
            ).length;

        return (
            <>
                <div className="page-title">
                    <h1>
                        Workforce Analytics
                    </h1>

                    <p>
                        Workforce and leave
                        statistics.
                    </p>
                </div>

                <div className="cards">
                    <StatCard
                        title="Employees"
                        value={total}
                    />

                    <StatCard
                        title="Available"
                        value={available}
                    />

                    <StatCard
                        title="On Leave"
                        value={onLeave}
                    />

                    <StatCard
                        title="Pending"
                        value={pending}
                    />

                    <StatCard
                        title="Total Leave Requests"
                        value={
                            leaves.length
                        }
                    />
                </div>

                <div className="panel">
                    <h2>
                        Leave Statistics
                    </h2>

                    <AnalyticsBar
                        name="Pending"
                        value={pending}
                        max={Math.max(
                            pending,
                            approved,
                            rejected,
                            1
                        )}
                    />

                    <AnalyticsBar
                        name="Approved"
                        value={approved}
                        max={Math.max(
                            pending,
                            approved,
                            rejected,
                            1
                        )}
                    />

                    <AnalyticsBar
                        name="Rejected"
                        value={rejected}
                        max={Math.max(
                            pending,
                            approved,
                            rejected,
                            1
                        )}
                    />
                </div>
            </>
        );
    }

    // =====================================================
    // WORKFORCE
    // =====================================================

    function WorkforcePage() {
        const available =
            employees.filter(
                (e) =>
                    e.status ===
                    "Available"
            );

        const onLeave =
            employees.filter(
                (e) =>
                    e.status ===
                    "On Leave"
            );

        const highWorkload =
            employees.filter(
                (e) =>
                    Number(
                        e.workload || 0
                    ) >= 8
            );

        return (
            <>
                <div className="page-title">
                    <h1>
                        Workforce Continuity
                    </h1>

                    <p>
                        Monitor employee
                        availability,
                        workload and
                        continuity risk.
                    </p>
                </div>

                <div className="cards">
                    <StatCard
                        title="Total"
                        value={
                            employees.length
                        }
                    />

                    <StatCard
                        title="Available"
                        value={
                            available.length
                        }
                    />

                    <StatCard
                        title="On Leave"
                        value={
                            onLeave.length
                        }
                    />

                    <StatCard
                        title="High Workload"
                        value={
                            highWorkload.length
                        }
                    />
                </div>

                <div className="panel">
                    <h2>
                        Workforce Status
                    </h2>

                    <EmployeeTable
                        data={employees}
                        showActions={false}
                    />
                </div>
            </>
        );
    }

    // =====================================================
    // REPLACEMENT
    // =====================================================

    function ReplacementPage() {
        const employeesOnLeave =
            employees.filter(
                (employee) =>
                    employee.status ===
                    "On Leave"
            );

        const approvedIds =
            leaves
                .filter(
                    (leave) =>
                        String(
                            leave.status
                        ).toUpperCase() ===
                        "APPROVED"
                )
                .map((leave) =>
                    Number(
                        leave.employeeId
                    )
                );

        const replacementEmployees = [
            ...employeesOnLeave,
            ...employees.filter(
                (employee) =>
                    approvedIds.includes(
                        Number(
                            employee.id
                        )
                    )
            ),
        ].filter(
            (employee, index, array) =>
                array.findIndex(
                    (x) =>
                        Number(x.id) ===
                        Number(
                            employee.id
                        )
                ) === index
        );

        return (
            <div className="panel">
                <div className="page-title">
                    <h1>
                        Employee Replacement
                    </h1>

                    <p>
                        Find suitable
                        employees to
                        maintain
                        workforce
                        continuity.
                    </p>
                </div>

                {replacementEmployees
                    .length === 0 ? (
                    <div className="empty">
                        No employees
                        currently
                        require
                        replacement.
                    </div>
                ) : (
                    replacementEmployees.map(
                        (employee) => (
                            <ReplacementItem
                                key={
                                    employee.id
                                }
                                employee={
                                    employee
                                }
                                getSuggestions={
                                    getReplacementSuggestions
                                }
                                assignReplacement={
                                    assignReplacement
                                }
                            />
                        )
                    )
                )}

                <h2>
                    Assigned Replacements
                </h2>

                {replacements.length ===
                0 ? (
                    <div className="empty">
                        No replacements
                        assigned yet.
                    </div>
                ) : (
                    replacements.map(
                        (replacement) => (
                            <div
                                className="replacement-card"
                                key={
                                    replacement.id
                                }
                            >
                                <b>
                                    {
                                        replacement.absentEmployee
                                    }
                                </b>

                                {" → "}

                                <b>
                                    {
                                        replacement.replacementEmployee
                                    }
                                </b>

                                <div
                                    style={{
                                        marginTop: 8,
                                    }}
                                >
                                    <span className="badge approved">
                                        {
                                            replacement.status
                                        }
                                    </span>
                                </div>
                            </div>
                        )
                    )
                )}
            </div>
        );
    }

    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    function NotificationsPage() {
        return (
            <div className="panel">
                <div className="header-row">
                    <h1>
                        Notifications
                    </h1>

                    <button
                        className="btn light"
                        onClick={loadAll}
                    >
                        Refresh
                    </button>
                </div>

                {notifications.length ===
                0 ? (
                    <div className="empty">
                        No notifications.
                    </div>
                ) : (
                    notifications.map(
                        (
                            notification,
                            index
                        ) => (
                            <div
                                className="replacement-card"
                                key={index}
                            >
                                🔔{" "}
                                {
                                    notification.message
                                }
                            </div>
                        )
                    )
                )}
            </div>
        );
    }

    // =====================================================
    // PAGE ROUTER
    // =====================================================

    function renderPage() {
        switch (page) {
            case "employees":
                return (
                    <EmployeesPage />
                );

            case "leaves":
                return <LeavesPage />;

            case "calendar":
                return (
                    <CalendarPage />
                );

            case "analytics":
                return (
                    <AnalyticsPage />
                );

            case "workforce":
                return (
                    <WorkforcePage />
                );

            case "replacement":
                return (
                    <ReplacementPage />
                );

            case "notifications":
                return (
                    <NotificationsPage />
                );

            default:
                return (
                    <DashboardPage />
                );
        }
    }

    return (
        <div className="app">
            <style>{styles}</style>

            <header className="topbar">
                <div className="brand">
                    Workforce System

                    <small>
                        Employee & Leave
                        Management
                    </small>
                </div>

                <div className="online">
                    ● System Online
                </div>
            </header>

            <div className="layout">
                <aside className="sidebar">
                    <NavButton
                        active={
                            page ===
                            "dashboard"
                        }
                        onClick={() =>
                            setPage(
                                "dashboard"
                            )
                        }
                    >
                        🏠 Dashboard
                    </NavButton>

                    <NavButton
                        active={
                            page ===
                            "employees"
                        }
                        onClick={() =>
                            setPage(
                                "employees"
                            )
                        }
                    >
                        👥 Employees
                    </NavButton>

                    <NavButton
                        active={
                            page === "leaves"
                        }
                        onClick={() =>
                            setPage(
                                "leaves"
                            )
                        }
                    >
                        📋 Leave Management
                    </NavButton>

                    <NavButton
                        active={
                            page ===
                            "calendar"
                        }
                        onClick={() =>
                            setPage(
                                "calendar"
                            )
                        }
                    >
                        📅 Leave Calendar
                    </NavButton>

                    <NavButton
                        active={
                            page ===
                            "analytics"
                        }
                        onClick={() =>
                            setPage(
                                "analytics"
                            )
                        }
                    >
                        📊 Analytics
                    </NavButton>

                    <NavButton
                        active={
                            page ===
                            "workforce"
                        }
                        onClick={() =>
                            setPage(
                                "workforce"
                            )
                        }
                    >
                        ⚡ Workforce
                    </NavButton>

                    <NavButton
                        active={
                            page ===
                            "replacement"
                        }
                        onClick={() =>
                            setPage(
                                "replacement"
                            )
                        }
                    >
                        🔄 Replacement
                    </NavButton>

                    <NavButton
                        active={
                            page ===
                            "notifications"
                        }
                        onClick={() =>
                            setPage(
                                "notifications"
                            )
                        }
                    >
                        🔔 Notifications
                    </NavButton>
                </aside>

                <main
                    className={`content ${
                        loading
                            ? "loading"
                            : ""
                    }`}
                >
                    {renderPage()}
                </main>
            </div>

            {/* IMPORTANT:
                These components are OUTSIDE App().
                This prevents the input from losing focus.
            */}

            <EmployeeModal
                showEmployee={
                    showEmployee
                }
                setShowEmployee={
                    setShowEmployee
                }
                employeeForm={
                    employeeForm
                }
                setEmployeeForm={
                    setEmployeeForm
                }
                addEmployee={
                    addEmployee
                }
            />

            <LeaveModal
                showLeave={showLeave}
                setShowLeave={
                    setShowLeave
                }
                employees={employees}
                leaveForm={leaveForm}
                setLeaveForm={
                    setLeaveForm
                }
                applyLeave={
                    applyLeave
                }
            />

            {message && (
                <div
                    className="toast"
                    onClick={() =>
                        setMessage("")
                    }
                >
                    {message}
                </div>
            )}
        </div>
    );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({ title, value }) {
    return (
        <div className="card">
            <div className="card-title">
                {title}
            </div>

            <div className="number">
                {value}
            </div>
        </div>
    );
}

// =========================================================
// NAV BUTTON
// =========================================================

function NavButton({
                       active,
                       onClick,
                       children,
                   }) {
    return (
        <button
            className={`nav ${
                active ? "active" : ""
            }`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

// =========================================================
// EMPLOYEE TABLE
// =========================================================

function EmployeeTable({
                           data,
                           showActions,
                       }) {
    return (
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Workload</th>
                <th>Status</th>

                {showActions && (
                    <th>Action</th>
                )}
            </tr>
            </thead>

            <tbody>
            {data.length === 0 ? (
                <tr>
                    <td
                        colSpan={
                            showActions
                                ? 8
                                : 7
                        }
                    >
                        <div className="empty">
                            No employees
                            found.
                        </div>
                    </td>
                </tr>
            ) : (
                data.map(
                    (employee) => (
                        <tr
                            key={
                                employee.id
                            }
                        >
                            <td>
                                #
                                {
                                    employee.id
                                }
                            </td>

                            <td>
                                <b>
                                    {
                                        employee.name
                                    }
                                </b>
                            </td>

                            <td>
                                {
                                    employee.email
                                }
                            </td>

                            <td>
                                {
                                    employee.role
                                }
                            </td>

                            <td>
                                {
                                    employee.department
                                }
                            </td>

                            <td>
                                {
                                    employee.workload ??
                                    0
                                }
                                /10
                            </td>

                            <td>
                                    <span
                                        className={
                                            employee.status ===
                                            "Available"
                                                ? "available"
                                                : "onleave"
                                        }
                                    >
                                        {
                                            employee.status
                                        }
                                    </span>
                            </td>

                            {showActions && (
                                <td>
                                    <button
                                        className="btn danger"
                                        onClick={() =>
                                            window.dispatchEvent(
                                                new CustomEvent(
                                                    "deleteEmployee",
                                                    {
                                                        detail:
                                                        employee.id,
                                                    }
                                                )
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            )}
                        </tr>
                    )
                )
            )}
            </tbody>
        </table>
    );
}

// =========================================================
// EMPLOYEE MODAL
// THIS IS OUTSIDE APP()
// =========================================================

function EmployeeModal({
                           showEmployee,
                           setShowEmployee,
                           employeeForm,
                           setEmployeeForm,
                           addEmployee,
                       }) {
    if (!showEmployee) {
        return null;
    }

    return (
        <div className="modal-bg">
            <div className="modal">
                <h2>
                    Add Employee
                </h2>

                <form
                    onSubmit={addEmployee}
                >
                    <label>
                        Name
                    </label>

                    <input
                        required
                        autoFocus
                        type="text"
                        value={
                            employeeForm.name
                        }
                        onChange={(e) =>
                            setEmployeeForm(
                                (previous) => ({
                                    ...previous,
                                    name: e
                                        .target
                                        .value,
                                })
                            )
                        }
                        placeholder="Enter employee name"
                    />

                    <label>
                        Email
                    </label>

                    <input
                        required
                        type="email"
                        value={
                            employeeForm.email
                        }
                        onChange={(e) =>
                            setEmployeeForm(
                                (previous) => ({
                                    ...previous,
                                    email: e
                                        .target
                                        .value,
                                })
                            )
                        }
                        placeholder="employee@company.com"
                    />

                    <div className="form-grid">
                        <div>
                            <label>
                                Role
                            </label>

                            <input
                                required
                                type="text"
                                value={
                                    employeeForm.role
                                }
                                onChange={(e) =>
                                    setEmployeeForm(
                                        (
                                            previous
                                        ) => ({
                                            ...previous,
                                            role: e
                                                .target
                                                .value,
                                        })
                                    )
                                }
                                placeholder="Software Developer"
                            />
                        </div>

                        <div>
                            <label>
                                Department
                            </label>

                            <select
                                value={
                                    employeeForm.department
                                }
                                onChange={(e) =>
                                    setEmployeeForm(
                                        (
                                            previous
                                        ) => ({
                                            ...previous,
                                            department:
                                            e
                                                .target
                                                .value,
                                        })
                                    )
                                }
                            >
                                <option value="IT">
                                    IT
                                </option>

                                <option value="Design">
                                    Design
                                </option>

                                <option value="HR">
                                    HR
                                </option>

                                <option value="Finance">
                                    Finance
                                </option>

                                <option value="Marketing">
                                    Marketing
                                </option>
                            </select>
                        </div>
                    </div>

                    <label>
                        Workload (1–10)
                    </label>

                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={
                            employeeForm.workload
                        }
                        onChange={(e) =>
                            setEmployeeForm(
                                (previous) => ({
                                    ...previous,
                                    workload:
                                        Number(
                                            e
                                                .target
                                                .value
                                        ),
                                })
                            )
                        }
                    />

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() =>
                                setShowEmployee(
                                    false
                                )
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn primary"
                        >
                            Add Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =========================================================
// LEAVE MODAL
// ALSO OUTSIDE APP()
// =========================================================

function LeaveModal({
                        showLeave,
                        setShowLeave,
                        employees,
                        leaveForm,
                        setLeaveForm,
                        applyLeave,
                    }) {
    if (!showLeave) {
        return null;
    }

    return (
        <div className="modal-bg">
            <div className="modal">
                <h2>
                    Apply Leave
                </h2>

                {employees.length === 0 ? (
                    <>
                        <div className="empty">
                            Add an employee
                            first before
                            applying leave.
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn secondary"
                                onClick={() =>
                                    setShowLeave(
                                        false
                                    )
                                }
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    <form
                        onSubmit={
                            applyLeave
                        }
                    >
                        <label>
                            Employee
                        </label>

                        <select
                            required
                            value={
                                leaveForm.employeeId ||
                                String(
                                    employees[0]
                                        .id
                                )
                            }
                            onChange={(e) =>
                                setLeaveForm(
                                    (
                                        previous
                                    ) => ({
                                        ...previous,
                                        employeeId:
                                        e
                                            .target
                                            .value,
                                    })
                                )
                            }
                        >
                            <option value="">
                                Select employee
                            </option>

                            {employees.map(
                                (
                                    employee
                                ) => (
                                    <option
                                        key={
                                            employee.id
                                        }
                                        value={
                                            employee.id
                                        }
                                    >
                                        #
                                        {
                                            employee.id
                                        }{" "}
                                        {
                                            employee.name
                                        }
                                    </option>
                                )
                            )}
                        </select>

                        <label>
                            Leave Type
                        </label>

                        <select
                            value={
                                leaveForm.leaveType
                            }
                            onChange={(e) =>
                                setLeaveForm(
                                    (
                                        previous
                                    ) => ({
                                        ...previous,
                                        leaveType:
                                        e
                                            .target
                                            .value,
                                    })
                                )
                            }
                        >
                            <option value="Casual">
                                Casual
                            </option>

                            <option value="Sick">
                                Sick
                            </option>

                            <option value="Vacation">
                                Vacation
                            </option>

                            <option value="Emergency">
                                Emergency
                            </option>
                        </select>

                        <div className="form-grid">
                            <div>
                                <label>
                                    Start Date
                                </label>

                                <input
                                    required
                                    type="date"
                                    value={
                                        leaveForm.startDate
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setLeaveForm(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                startDate:
                                                e
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    End Date
                                </label>

                                <input
                                    required
                                    type="date"
                                    value={
                                        leaveForm.endDate
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setLeaveForm(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                endDate:
                                                e
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <label>
                            Reason
                        </label>

                        <textarea
                            required
                            value={
                                leaveForm.reason
                            }
                            onChange={(e) =>
                                setLeaveForm(
                                    (
                                        previous
                                    ) => ({
                                        ...previous,
                                        reason: e
                                            .target
                                            .value,
                                    })
                                )
                            }
                            placeholder="Enter reason for leave"
                        />

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={() =>
                                    setShowLeave(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn primary"
                            >
                                Apply Leave
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// =========================================================
// REPLACEMENT ITEM
// =========================================================

function ReplacementItem({
                             employee,
                             getSuggestions,
                             assignReplacement,
                         }) {
    const [
        suggestions,
        setSuggestions,
    ] = useState([]);

    const [
        loadingSuggestions,
        setLoadingSuggestions,
    ] = useState(false);

    async function showSuggestions() {
        setLoadingSuggestions(true);

        const data =
            await getSuggestions(
                employee.id
            );

        setSuggestions(data);

        setLoadingSuggestions(false);
    }

    return (
        <div className="replacement-card">
            <div className="replacement-header">
                <div>
                    <b>
                        {employee.name}
                    </b>

                    <div>
                        {employee.role} ·{" "}
                        {
                            employee.department
                        }
                    </div>
                </div>

                <button
                    className="btn primary"
                    onClick={
                        showSuggestions
                    }
                >
                    {loadingSuggestions
                        ? "Finding..."
                        : "Suggest Replacement"}
                </button>
            </div>

            {suggestions.length >
                0 && (
                    <div className="suggestions">
                        <b>
                            Recommended
                            Employees
                        </b>

                        {suggestions.map(
                            (candidate) => (
                                <div
                                    className="suggestion-row"
                                    key={
                                        candidate.id
                                    }
                                >
                                    <div>
                                        <b>
                                            {
                                                candidate.name
                                            }
                                        </b>

                                        <div>
                                            {
                                                candidate.role
                                            }{" "}
                                            · Workload{" "}
                                            {
                                                candidate.workload
                                            }
                                            /10
                                        </div>
                                    </div>

                                    <button
                                        className="btn success"
                                        onClick={() =>
                                            assignReplacement(
                                                employee.id,
                                                candidate.id
                                            )
                                        }
                                    >
                                        Assign
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}
        </div>
    );
}

// =========================================================
// ANALYTICS BAR
// =========================================================

function AnalyticsBar({
                          name,
                          value,
                          max,
                      }) {
    return (
        <div
            style={{
                marginBottom: 20,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    marginBottom: 6,
                }}
            >
                <b>{name}</b>
                <b>{value}</b>
            </div>

            <div
                style={{
                    height: 18,
                    background:
                        "#e2e8f0",
                    borderRadius: 20,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${
                            (value / max) *
                            100
                        }%`,
                        height: "100%",
                        background:
                            "#4f46e5",
                        borderRadius: 20,
                    }}
                />
            </div>
        </div>
    );
}

// =========================================================
// STYLES
// =========================================================

const styles = `
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f1f5f9;
    color: #1e293b;
}

button {
    cursor: pointer;
    border: none;
    font-family: inherit;
}

.app {
    min-height: 100vh;
}

.topbar {
    height: 70px;
    background: #172554;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
}

.brand {
    font-size: 21px;
    font-weight: 800;
}

.brand small {
    display: block;
    font-size: 11px;
    opacity: .7;
    font-weight: 400;
    margin-top: 3px;
}

.online {
    background: #16a34a;
    padding: 7px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
}

.layout {
    display: flex;
    min-height: calc(100vh - 70px);
}

.sidebar {
    width: 235px;
    background: white;
    border-right: 1px solid #e2e8f0;
    padding: 18px 12px;
    flex-shrink: 0;
}

.nav {
    display: block;
    width: 100%;
    padding: 12px 14px;
    margin: 4px 0;
    border-radius: 9px;
    background: transparent;
    color: #475569;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
}

.nav:hover {
    background: #f1f5f9;
}

.nav.active {
    background: #e0e7ff;
    color: #3730a3;
}

.content {
    flex: 1;
    padding: 28px;
    overflow-x: auto;
}

.page-title h1,
.header-row h1 {
    margin: 0;
    color: #172554;
}

.page-title p {
    color: #64748b;
    margin-top: 7px;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 22px;
}

.actions {
    display: flex;
    gap: 9px;
    flex-wrap: wrap;
}

.btn {
    padding: 10px 15px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 13px;
}

.primary {
    background: #3730a3;
    color: white;
}

.success {
    background: #16a34a;
    color: white;
}

.danger {
    background: #dc2626;
    color: white;
}

.secondary {
    background: #64748b;
    color: white;
}

.light {
    background: #e2e8f0;
    color: #334155;
}

.cards {
    display: grid;
    grid-template-columns: repeat(5, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 22px;
}

.card {
    background: white;
    padding: 20px;
    border-radius: 13px;
    box-shadow: 0 3px 12px rgba(15,23,42,.06);
}

.card-title {
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
}

.number {
    margin-top: 8px;
    font-size: 30px;
    font-weight: 800;
    color: #172554;
}

.panel {
    background: white;
    border-radius: 13px;
    padding: 22px;
    margin-bottom: 22px;
    box-shadow: 0 3px 12px rgba(15,23,42,.05);
}

.panel h2 {
    margin-top: 0;
    color: #172554;
}

input,
select,
textarea {
    width: 100%;
    padding: 11px 12px;
    margin-top: 5px;
    margin-bottom: 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    outline: none;
    font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,.12);
}

textarea {
    min-height: 90px;
    resize: vertical;
}

label {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 13px 11px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    font-size: 13px;
}

th {
    background: #f8fafc;
    color: #475569;
}

.badge {
    display: inline-block;
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
}

.badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.badge.approved {
    background: #dcfce7;
    color: #166534;
}

.badge.rejected {
    background: #fee2e2;
    color: #991b1b;
}

.available {
    color: #15803d;
    font-weight: 700;
}

.onleave {
    color: #b45309;
    font-weight: 700;
}

.calendar-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    gap: 10px;
    flex-wrap: wrap;
}

.month-title {
    font-size: 22px;
    font-weight: 800;
    color: #172554;
}

.calendar-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 18px;
}

.stat-pill {
    padding: 8px 13px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
}

.stat-pending {
    background: #fef3c7;
    color: #92400e;
}

.stat-approved {
    background: #dcfce7;
    color: #166534;
}

.stat-rejected {
    background: #fee2e2;
    color: #991b1b;
}

.calendar-week,
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(100px, 1fr));
    gap: 7px;
}

.weekday {
    text-align: center;
    padding: 10px;
    background: #172554;
    color: white;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 800;
}

.calendar-day {
    min-height: 125px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
}

.calendar-day.today {
    border: 2px solid #4f46e5;
}

.empty-day {
    background: #f8fafc;
}

.day-number {
    font-size: 13px;
    font-weight: 800;
    color: #334155;
    margin-bottom: 6px;
}

.leave-event {
    padding: 7px;
    border-radius: 6px;
    margin-bottom: 5px;
    font-size: 10px;
    line-height: 1.35;
}

.leave-event.pending {
    background: #fffbeb;
    color: #92400e;
}

.leave-event.approved {
    background: #f0fdf4;
    color: #166534;
}

.leave-event.rejected {
    background: #fef2f2;
    color: #991b1b;
}

.event-name {
    font-weight: 800;
}

.replacement-card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    margin: 12px 0;
    background: white;
}

.replacement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

.suggestions {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
}

.suggestion-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 7px;
    gap: 10px;
}

.modal-bg {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 20px;
}

.modal {
    background: white;
    width: 520px;
    max-width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 14px;
    padding: 25px;
}

.modal h2 {
    margin-top: 0;
    color: #172554;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 10px;
}

.toast {
    position: fixed;
    right: 22px;
    bottom: 22px;
    background: #172554;
    color: white;
    padding: 14px 18px;
    border-radius: 9px;
    z-index: 200;
    max-width: 420px;
    font-size: 13px;
    font-weight: 600;
}

.empty {
    padding: 30px;
    text-align: center;
    color: #64748b;
}

.loading {
    opacity: .6;
    pointer-events: none;
}

@media(max-width: 1100px) {
    .cards {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media(max-width: 800px) {
    .layout {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        display: flex;
        overflow-x: auto;
    }

    .nav {
        min-width: 150px;
    }

    .cards {
        grid-template-columns: repeat(2, 1fr);
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}

@media(max-width: 550px) {
    .content {
        padding: 15px;
    }

    .cards {
        grid-template-columns: 1fr;
    }

    .calendar-grid,
    .calendar-week {
        grid-template-columns: repeat(7, 95px);
    }

    .calendar-panel {
        overflow-x: auto;
    }
}
`;

// =========================================================
// DELETE EMPLOYEE EVENT HANDLER
// =========================================================

window.addEventListener(
    "deleteEmployee",
    async (event) => {
        const id = event.detail;

        const response = await fetch(
            `${API}/employees/${id}`,
            {
                method: "DELETE",
            }
        );

        if (response.ok) {
            window.location.reload();
        }
    }
);

export default App;