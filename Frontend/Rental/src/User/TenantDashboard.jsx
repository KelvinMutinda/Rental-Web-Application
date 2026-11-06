import React from "react";
import{useState} from "react";
import {Link} from "react-router-dom";


function TenantDashboard() {

const [isOpen, setIsOpen]=useState(false);
const toggleMenu=()=>setIsOpen(!isOpen)
const closeMenu=()=>setIsOpen(false)
  return (
  <>
    <div className="headers">
       <div className={`head2 ${isOpen? "open":" "}`}>
         <div className="weru2">
          <button className="w-button2">W</button>
          <div className="werus2">
            <h3>WERU HOSTELS</h3>
            <p>A LITTLE MORE CLASS HOME</p>
          </div>
        </div>
        <div className="close-icon" onClick={closeMenu}>
            ✖
        </div>
         <nav className="navs2">
                  <Link to="/" onClick={closeMenu}>Home</Link>
                  <a href="#about" onClick={closeMenu}>About</a>
                  <a href="#contact" onClick={closeMenu}>Contact Us</a>
          </nav>
       </div>
       <div className="menu-icon" onClick={toggleMenu}>
         ☰
       </div>

    </div>
    <div className="dashboard">

      <main className="main">
     
        <div className="breadcrumb">
          <span className="breadcrumb-line"></span>
          <span>RESIDENT SPACE · TENANT PREVIEW</span>
        </div>

        
        <h1 className="welcome-title">Welcome home, Amara.</h1>
        <p className="welcome-sub">
          A simple overview of your room, rent and recent payment history.
        </p>

        <div className="preview-banner">
          <span className="icon">ⓘ</span>
          <p>
            <strong>Preview data — not live.</strong> These fictional examples
            are for screen preview only. No rent or payment information is
            connected.
          </p>
        </div>

      
        <div className="resident-card">
          <div className="resident-top">
            <div>
              <div className="resident-label">YOUR RESIDENCE</div>
              <h2 className="resident-name">Amara Njeri</h2>
              <p className="resident-reg">Course registration · SC/2023/0418</p>
            </div>

            <div className="room-badge">
              <div className="room-badge-label">ROOM</div>
              <div className="room-badge-number">A-04</div>
              <div className="room-badge-type">Single</div>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <div className="info-label">Phone</div>
              <div className="info-value">Not provided in this preview</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">amara.njeri@example.test</div>
            </div>
            <div className="info-item">
              <div className="info-label">Course</div>
              <div className="info-value">Environmental Science</div>
            </div>
            <div className="info-item">
              <div className="info-label">Room type</div>
              <div className="info-value">Single room</div>
            </div>
          </div>
        </div>

      
        <div className="two-col">
          <div className="rent-card">
            <div className="rent-label">SEPTEMBER RENT</div>
            <div className="rent-amount">KES 18,000</div>

            <div className="rent-details">
              <div className="rent-row">
                <span>Amount paid</span>
                <span>KES 12,000</span>
              </div>
              <div className="rent-row">
                <span>Balance due</span>
                <span>KES 6,000</span>
              </div>
              <div className="rent-due">Due 05 September 2025</div>
            </div>

            <button className="btn-payment">
              Payment options
              <span>→</span>
            </button>
          </div>

          <div className="know-card">
            <div className="know-label">YOUR RENT, CLEARLY</div>
            <h3 className="know-title">Know where you stand.</h3>
            <p className="know-text">
              Your current balance is shown separately from payments already
              recorded. Room placement and rent are assigned by the residence
              administrator.
            </p>
            <div className="know-note">
              <span>✓</span>
              <span>No payment action is available in this preview.</span>
            </div>
          </div>
        </div>

     
        <div className="history-card">
          <div className="history-header">
            <div>
              <div className="history-label">PAYMENT HISTORY</div>
              <h3 className="history-title">Recent entries</h3>
            </div>
            <span className="history-example">Example only</span>
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>REFERENCE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>05 Sep 2025</td>
                <td className="ref">QH7•••4PK</td>
                <td>KES 18,000</td>
                <td>
                  <span className="status">Confirmed</span>
                </td>
              </tr>
              <tr>
                <td>05 Aug 2025</td>
                <td className="ref">QH4•••6JM</td>
                <td>KES 18,000</td>
                <td>
                  <span className="status">Confirmed</span>
                </td>
              </tr>
              <tr>
                <td>05 Jul 2025</td>
                <td className="ref">QH2•••8JN</td>
                <td>KES 9,000</td>
                <td>
                  <span className="status">Part payment</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="footer-links">
          <a href="#">
            <span>→</span> Login screen
          </a>
          <a href="#">
            <span>▦</span> Admin preview
          </a>
        </div>
      </main>

      
      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>Weru Hostels</span>
          <span>A welcoming place to call home.</span>
        </div>
      </footer>
    </div>
    </>
  );
}

export default TenantDashboard;