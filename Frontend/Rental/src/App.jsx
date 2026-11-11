import './App.css'
import Login from './auth/Login'
import Register from './auth/Register'
import HomePage from './pages/HomePage'
import { Routes, Route } from 'react-router-dom'
import TenantDashboard from './User/TenantDashboard'
import AdminDashboard from './Admin/AdminDashboard'
import AppToaster from './AppToaster'
import ProtectedRoute from './ProtectedRoute'

function App() {
  return (
    <>
      <AppToaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/AdminDashboard"
          element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/TenantDashboard"
          element={<ProtectedRoute role="tenant"><TenantDashboard /></ProtectedRoute>}
        />
      </Routes>
    </>
  )
}

export default App