import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Login() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const found = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = 'Enter a valid email address';
    if (!form.password) found.password = 'Enter your password';
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error(Object.values(found)[0]);
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Signing you in…');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || 'Login failed. Please try again.', { id: toastId });
        return;
      }

<<<<<<< HEAD
  
=======
      // keep the session so the dashboards (and later API calls) can use it
>>>>>>> eb26c5fc09e9050a855d98b3b2c79407f9eb4aaa
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user.firstName}!`, { id: toastId });
      navigate(data.user.role === 'admin' ? '/AdminDashboard' : '/TenantDashboard');
    } catch (err) {
      toast.error('Cannot reach the server. Check your connection.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="header-wrapper">
        <div className="menu-icon" onClick={toggleMenu}>☰</div>

        <div className={`header2 ${isOpen ? 'open' : ''}`}>
          <div className="close-icon" onClick={toggleMenu}>✖</div>

          <div className="weru2">
            <div className="w"><button className="w-button2">W</button></div>
            <div className="werus2">
              <h3>WERU HOSTELS</h3>
              <p>A LITTLE MORE AT HOME</p>
            </div>
          </div>

          <nav className="navs2">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#contact" onClick={closeMenu}>Contact Us</a>
          </nav>

          <div className="auth-btns2">
            <button className="login"><Link to="/login">Login</Link></button>
            <button className="signup"><Link to="/register">Sign up</Link></button>
          </div>
        </div>
      </header>

      <main className="login-page-container">
        <div className="resident-access">
          <p>—— Resident Access</p>
          <h3>Good to have you here.</h3>
        </div>

        <div className="forms">
          <div className="login-form">
            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email" type="email" name="email" placeholder="your@gmail.com"
                  value={form.email} onChange={handleChange} autoComplete="email"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <small className="field-error">{errors.email}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password" type="password" name="password" placeholder="Enter your password"
                  value={form.password} onChange={handleChange} autoComplete="current-password"
                  className={errors.password ? 'input-error' : ''}
                />
                {errors.password && <small className="field-error">{errors.password}</small>}
              </div>

<<<<<<< HEAD
            
=======
              {/* the old <Link to="/login"> inside this button sent users back to the login page – removed */}
>>>>>>> eb26c5fc09e9050a855d98b3b2c79407f9eb4aaa
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Please wait…' : 'Login'} <ArrowRight size={18} />
              </button>

              <span className="register-link">
                New to Weru Hostels? <Link to="/register"><span className="reg">Register</span></Link>
              </span>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;