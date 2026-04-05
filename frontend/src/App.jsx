import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LayoutProvider } from './context/LayoutContext'
import PrivateRoute from './routes/PrivateRoute'

import Landing   from './pages/Landing/Landing'
import Login     from './pages/Login/Login'
import Register  from './pages/Register/Register'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import TaskBoard from './pages/TaskBoard/TaskBoard'
import TaskList  from './pages/TaskList/TaskList'
import CreateTask from './pages/CreateTask/CreateTask'
import TaskDetails from './pages/TaskDetails/TaskDetails'
import CalendarView from './pages/CalendarView/CalendarView'
import Analytics from './pages/Analytics/Analytics'
import Profile   from './pages/Profile/Profile'
import TeamProjects from './pages/TeamProjects/TeamProjects'

export default function App() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' } }} />
          <Routes>
            <Route path="/"         element={<Landing />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tasks"      element={<PrivateRoute><TaskBoard /></PrivateRoute>} />
            <Route path="/tasks/list" element={<PrivateRoute><TaskList /></PrivateRoute>} />
            <Route path="/tasks/calendar" element={<PrivateRoute><CalendarView /></PrivateRoute>} />
            <Route path="/tasks/new"  element={<PrivateRoute><CreateTask /></PrivateRoute>} />
            <Route path="/tasks/:taskId"  element={<PrivateRoute><TaskDetails /></PrivateRoute>} />
            <Route path="/tasks/:taskId/edit"  element={<PrivateRoute><CreateTask /></PrivateRoute>} />
            <Route path="/teams"      element={<PrivateRoute><TeamProjects /></PrivateRoute>} />
            <Route path="/analytics"  element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </LayoutProvider>
    </AuthProvider>
  )
}
