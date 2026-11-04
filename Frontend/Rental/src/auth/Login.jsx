import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function Login() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu=()=>setIsOpen(false);

  return (
    <>
      {/* HEADER */}
      <header className="header-wrapper">
        {/* Mobile Hamburger Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>

        <div className={`header2 ${isOpen ? 'open' : ''}`}>
          {/* Close Icon for Mobile */}
          <div className="close-icon" onClick={toggleMenu}>
            ✖
          </div>

          {/* LOGO */}
          <div className="weru2">
            <div className="w">
              <button className="w-button2">W</button>
            </div>
            <div className="werus2">
              <h3>WERU HOSTELS</h3>
              <p>A LITTLE MORE AT HOME</p>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="navs2">
            <Link to="/">Home</Link>
             <a href="#about" onClick={closeMenu}>About</a>
            <a href="#contact" onClick={closeMenu}>Contact Us</a>
          </nav>

          {/* BUTTONS */}
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
            <form className="form">
              
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="your@gmail.com" 
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password" 
                />
                
              </div>

          
              <button type="submit" className="login-btn">
               <Link to="/login">Login</Link>  <ArrowRight size={18} />
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