import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://rental-web-application-2.onrender.com//api';

const EMPTY = {
  firstName: '', lastName: '', email: '', phoneno: '', regno: '',
  course: '', roomType: '', parentPhone: '', password: '', cpassword: '',
};


function validate(f) {
  const e = {};
  if (!f.firstName.trim()) e.firstName = 'Enter your first name';
  if (!f.lastName.trim()) e.lastName = 'Enter your last name';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address';
  if (!/^[0-9+\s]{9,15}$/.test(f.phoneno)) e.phoneno = 'Enter a valid phone number';
  if (!f.regno.trim()) e.regno = 'Enter your registration number';
  if (!f.course.trim()) e.course = 'Enter your course';
  if (!f.roomType) e.roomType = 'Choose a room type';
  if (!/^[0-9+\s]{9,15}$/.test(f.parentPhone)) e.parentPhone = 'Enter a valid parent/guardian phone';
  if (f.password.length < 6) e.password = 'Use at least 6 characters';
  if (f.cpassword !== f.password) e.cpassword = 'Passwords do not match';
  return e;
}

function Field({ label, name, type = 'text', placeholder, value, error, onChange }) {
  return (
    <div className="div-groups">
      <label htmlFor={name}>{label}</label>
      <input
        id={name} name={name} type={type} placeholder={placeholder}
        value={value} onChange={onChange}
        className={error ? 'input-error' : ''}
        aria-invalid={!!error}
      />
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const [form, setForm] = useState(EMPTY);
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

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error(Object.values(found)[0]);
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your account…');
    try {
      const { cpassword, ...payload } = form;          // the backend does not need the confirm field
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || 'Registration failed. Please try again.', { id: toastId });
        return;
      }

      toast.success('Application received! Please log in.', { id: toastId, duration: 4000 });
      setForm(EMPTY);
      setTimeout(() => navigate('/login'), 1200);       // let the toast be seen, then go to login
    } catch (err) {
      toast.error('Cannot reach the server. Check your connection.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      <main className="register-page">
        <div className="intro">
          <p>——FUTURE RESIDENTS</p>
          <h3>Let’s start with hello.</h3>
        </div>

        <div className="registers-form">
          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <p>01 About you</p>
            <p>Your personal and Academic profile</p>
            <span>Your contact and study details</span>

            <div className="personal">
              <div className="group">
                <Field label="First Name" name="firstName" placeholder="First Name" value={form.firstName} error={errors.firstName} onChange={handleChange} />
                <Field label="Last Name" name="lastName" placeholder="Last Name" value={form.lastName} error={errors.lastName} onChange={handleChange} />
              </div>
              <div className="group">
                <Field label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} error={errors.email} onChange={handleChange} />
                <Field label="Phone Number" name="phoneno" type="tel" placeholder="0712 345 678" value={form.phoneno} error={errors.phoneno} onChange={handleChange} />
              </div>
              <div className="group">
                <Field label="Reg No" name="regno" placeholder="e.g. SC/2023/0418" value={form.regno} error={errors.regno} onChange={handleChange} />
                <Field label="Course" name="course" placeholder="Course" value={form.course} error={errors.course} onChange={handleChange} />
              </div>
              <div className="group">
                <div className="div-groups">
                  <label htmlFor="roomType">Room Type</label>
                  <select
                    id="roomType" name="roomType" value={form.roomType} onChange={handleChange}
                    className={errors.roomType ? 'input-error' : ''}
                  >
                    <option value="">--Select Room Type--</option>
                    <option value="Single room">Single room</option>
                    <option value="2 Bedroom">2 Bedroom</option>
                    <option value="Bedsitter">Bedsitter</option>
                  </select>
                  {errors.roomType && <small className="field-error">{errors.roomType}</small>}
                </div>
                <Field label="Parent/Guardian Contact" name="parentPhone" type="tel" placeholder="Parent phone" value={form.parentPhone} error={errors.parentPhone} onChange={handleChange} />
              </div>
            </div>

            <div className="approval">
              <ShieldCheck />
              <span> Rooms Rented are secured after approval from the Admin</span>
              <br /><span>Rental details are sent after Approval</span>
            </div>

            <p>02 Create a Secure Password</p>
            <div className="password">
              <div className="group">
                <Field label="Password" name="password" type="password" placeholder="Enter password" value={form.password} error={errors.password} onChange={handleChange} />
                <Field label="Confirm password" name="cpassword" type="password" placeholder="Confirm password" value={form.cpassword} error={errors.cpassword} onChange={handleChange} />
              </div>
            </div>

            <button className="apply" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : 'Apply for Room'}
            </button>
            <span>Already have an account? <Link to="/login">Login</Link></span>
          </form>
        </div>
      </main>
    </>
  );
}

export default Register;