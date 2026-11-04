import React from "react";
import { Link } from "react-router-dom";


function AdminDashboard() {
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-mark">H</div>
            <div className="logo-text">
              <div className="logo-name">HAVEN HOUSE</div>
              <div className="logo-sub">STUDENT LIVING</div>
            </div>
          </div>

          <nav className="nav">
            <Link to="#">Home</Link>
            <Link to="/login">Log in</Link>
            <Link to="#" className="btn-primary">
              Apply to stay <span>→</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="main">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="breadcrumb-line"></span>
          <span>RESIDENCE OVERVIEW · STAFF PREVIEW</span>
        </div>

        {/* Title */}
        <h1 className="welcome-title">A clear view of home.</h1>
        <p className="welcome-sub">
          Room availability, rent due and the latest receipt activity—all in one place.
        </p>

        {/* Preview banner */}
        <div className="preview-banner">
          <span className="icon">ⓘ</span>
          <p>
            <strong>Preview data — not live.</strong> These fictional examples
            are for screen preview only. No rent or payment information is
            connected.
          </p>
        </div>

        {/* Property Snapshot */}
        <div className="snapshot-header">
          <div>
            <div className="snapshot-label">PROPERTY SNAPSHOT</div>
            <div className="snapshot-meta">Example month · September 2025</div>
          </div>
          <div className="staff-badge">
            <span>🛡</span> Staff view
          </div>
        </div>

        <div className="snapshot-grid">
          {/* Rooms card */}
          <div className="snapshot-card dark">
            <div className="snapshot-card-label">ROOMS</div>
            <div className="snapshot-value">24</div>
            <div className="snapshot-sub">
              18 occupied &nbsp;&nbsp; 6 available
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }}></div>
            </div>
          </div>

          {/* Expected rent */}
          <div className="snapshot-card">
            <div className="snapshot-card-label">EXPECTED RENT</div>
            <div className="snapshot-value">KES 396,000</div>
            <div className="snapshot-sub">For September</div>
          </div>

          {/* Confirmed */}
          <div className="snapshot-card">
            <div className="snapshot-card-label">CONFIRMED</div>
            <div className="snapshot-value">KES 312,000</div>
            <div className="snapshot-sub">79% received</div>
          </div>

          {/* Open balances */}
          <div className="snapshot-card">
            <div className="snapshot-card-label">OPEN BALANCES</div>
            <div className="snapshot-value open-balance">KES 84,000</div>
            <div className="snapshot-sub">Across 7 residents</div>
          </div>
        </div>

        {/* Room Directory */}
        <div className="section-card">
          <div className="section-header">
            <div>
              <div className="section-label">ROOM DIRECTORY</div>
              <h2 className="section-title">Rooms & residents</h2>
            </div>
            <span className="section-note">Default monthly rent</span>
          </div>

          {/* Pricing strip */}
          <div className="pricing-strip">
            <div className="pricing-item">
              <div className="pricing-icon">S</div>
              <div className="pricing-info">
                <div className="pricing-name">Single room</div>
                <div className="pricing-desc">Private space</div>
              </div>
              <div className="pricing-price">KES 18,000 / month</div>
            </div>
            <div className="pricing-item">
              <div className="pricing-icon">T</div>
              <div className="pricing-info">
                <div className="pricing-name">Shared room</div>
                <div className="pricing-desc">Shared occupancy</div>
              </div>
              <div className="pricing-price">KES 12,000 / month</div>
            </div>
          </div>

          {/* Rooms table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>ROOM</th>
                <th>TYPE</th>
                <th>OCCUPANT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A-04</td>
                <td>Single</td>
                <td>Amara Njeri</td>
                <td>
                  <span className="status-pill status-occupied">Occupied</span>
                </td>
              </tr>
              <tr>
                <td>A-07</td>
                <td>Shared</td>
                <td>Kito Mwangi</td>
                <td>
                  <span className="status-pill status-occupied">Occupied</span>
                </td>
              </tr>
              <tr>
                <td>B-02</td>
                <td>Single</td>
                <td>Leah Otieno</td>
                <td>
                  <span className="status-pill status-occupied">Occupied</span>
                </td>
              </tr>
              <tr>
                <td>B-06</td>
                <td>Shared</td>
                <td>Available</td>
                <td>
                  <span className="status-pill status-available">Available</span>
                </td>
              </tr>
              <tr>
                <td>C-03</td>
                <td>Single</td>
                <td>Available</td>
                <td>
                  <span className="status-pill status-available">Available</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Receipt Activity */}
        <div className="section-card">
          <div className="section-header">
            <div>
              <div className="section-label">RECEIPT ACTIVITY</div>
              <h2 className="section-title">Recent M-Pesa entries</h2>
            </div>
            <span className="section-note">Fictional transactions</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>REFERENCE</th>
                <th>RESIDENT</th>
                <th>AMOUNT</th>
                <th>RECEIVED</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ref-code">QH7•••4PK</td>
                <td>Amara Njeri</td>
                <td>KES 18,000</td>
                <td>Today, 10:42</td>
                <td>
                  <span className="status-pill status-confirmed">Confirmed</span>
                </td>
              </tr>
              <tr>
                <td className="ref-code">QH6•••91D</td>
                <td>Kito Mwangi</td>
                <td>KES 12,000</td>
                <td>Today, 09:18</td>
                <td>
                  <span className="status-pill status-review">Review</span>
                </td>
              </tr>
              <tr>
                <td className="ref-code">QH5•••2LA</td>
                <td>Leah Otieno</td>
                <td>KES 18,000</td>
                <td>Yesterday</td>
                <td>
                  <span className="status-pill status-confirmed">Confirmed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer links */}
        <div className="admin-footer-links">
          <a href="#">
            <span>⌂</span> Tenant preview
          </a>
          <a href="#">
            Back to login <span>→</span>
          </a>
        </div>
      </main>

      {/* Site footer */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>Haven House Student Living</span>
          <span>A welcoming place to call home.</span>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;