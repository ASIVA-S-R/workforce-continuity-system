import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'

import ManagerDashboard from './pages/ManagerDashboard'

import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeProfile from './pages/EmployeeProfile'
import ApplyLeave from './pages/ApplyLeave'
import LeaveHistory from './pages/LeaveHistory'
import LeaveCalendar from './pages/LeaveCalendar'
import EmployeeAnalytics from './pages/EmployeeAnalytics'


function App() {

    return (
        <Routes>

            {/* LOGIN */}

            <Route
                path="/login"
                element={<Login />}
            />


            {/* DEFAULT */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />


            {/* MANAGER */}

            <Route
                path="/manager/dashboard"
                element={<ManagerDashboard />}
            />


            {/* EMPLOYEE */}

            <Route
                path="/employee/dashboard"
                element={<EmployeeDashboard />}
            />

            <Route
                path="/employee/profile"
                element={<EmployeeProfile />}
            />

            <Route
                path="/employee/apply-leave"
                element={<ApplyLeave />}
            />

            <Route
                path="/employee/leave-history"
                element={<LeaveHistory />}
            />

            <Route
                path="/employee/leave-calendar"
                element={<LeaveCalendar />}
            />

            <Route
                path="/employee/analytics"
                element={<EmployeeAnalytics />}
            />


            {/* UNKNOWN URL */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    )
}

export default App