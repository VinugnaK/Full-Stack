import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './routes/PrivateRoute'

import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import TaskBoard from './pages/TaskBoard/TaskBoard'
import TaskList from './pages/TaskList/TaskList'
import CreateTask from './pages/CreateTask/CreateTask'
import Analytics from './pages/Analytics/Analytics'
import Profile from './pages/Profile/Profile'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tasks/board" element={<PrivateRoute><TaskBoard /></PrivateRoute>} />
          <Route path="/tasks/list" element={<PrivateRoute><TaskList /></PrivateRoute>} />
          <Route path="/tasks/create" element={<PrivateRoute><CreateTask /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
