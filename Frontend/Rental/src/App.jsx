

import './App.css'
import Login from './auth/Login'
import Register from './auth/Register'
import HomePage from './pages/HomePage'
import {Routes,Route} from 'react-router-dom'
import TenantDashboard from './User/TenantDashboard'
import AdminDashboard from './Admin/AdminDashboard'

function App() {
  

  return (
    <>
     <Routes>
      <Route path="/"element={<HomePage/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/TenantDashboard" element={<TenantDashboard/>}/>
      <Route path="/AdminDashboard" element={<AdminDashboard/>}/>
     </Routes>
    </>
  )
}

export default App
