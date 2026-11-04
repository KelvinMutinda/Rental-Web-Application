import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

function Register() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

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
            <Link to="#">Home</Link>
            <Link to="#">About</Link>
            <Link to="#">Contact Us</Link>
          </nav>

          {/* BUTTONS */}
          <div className="auth-btns2">
            <button className="login">Login</button>
            <button className="signup">Sign up</button>
          </div>
        </div>
      </header>
      <main className="register-page">
        <div className="intro">
          <p>——FUTURE RESIDENTS</p>
          <h3>Let’s start with hello.</h3>
        </div>
        <div className="registers-form">
          <form  className="register-form">
             <p>01 About you</p>
             <p>Your personal and Academic profile</p>
             <span>Your contact and study details</span>
             <div className="personal">
              <div className="group">
                <div className="div-groups">
                  <label>First Name</label>
                  <input type="text" name="firstname" placeholder="First Name"/>

                </div>
                <div className="div-groups">
                  <label>Last Name</label>
                  <input type="text" name="lastname" placeholder="Last Name"/>
                  
                </div>
              </div>
              <div className="group">
                <div className="div-groups">
                  <label>Email</label>
                  <input type="text" name="firstname" placeholder="First Name"/>
                  
                </div>
                <div className="div-groups">
                  <label>Phone Number</label>
                  <input type="text" name="firstname" placeholder="First Name"/>
                  
                </div>
              </div>
              <div className="group">
               <div className="div-groups">
                <label>Reg No</label>
                <input type="text" name="firstname" placeholder="First Name"/>
                
              </div>
               <div className="div-groups">
                <label>Course</label>
                <input type="text" name="course" placeholder="Course"/>
                
              </div>
             </div>
              <div className="group">
               <div className="div-groups">
                <label>Room Type</label>
                <select >
                  <option>--Select Room Type--</option>
                  <option>Single room</option>
                  <option>2 Bedroom</option>
                  <option>Bedsitter</option>
                </select>
                
              </div>
               <div className="div-groups">
                <label>Parent/Guardian Contact</label>
                <input type="text" name="parentno" placeholder="Parent phone"/>
                
              </div>
             </div>
            </div>
            <div className="approval">
              <ShieldCheck/>
              <span> Rooms Rented are secured after approval from the Admin</span>
              <br/><span>Rental details are send after Approval</span>
            </div>

            <p>02 Create a Secure Password</p>
            <div className="password">
              <div className="group">
               <div className="div-groups">
                <label>Password</label>
                <input type="password" name="password" placeholder="Enter password"/>
                
              </div>
               <div className="div-groups">
                <label>Confirm password</label>
                <input type="password" name="cpassword" placeholder="Confirm password"/>
                
              </div>
             </div>
            </div>
            <button className="apply">Apply for Room </button>
            <span>Already have an account? <Link to="/login">Login</Link></span>

          </form>
         

        </div>
      </main>
      

     
    </>
  );
}

export default Register;