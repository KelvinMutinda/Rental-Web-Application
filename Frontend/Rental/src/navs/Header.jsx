import React, { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="header-wrapper">
      <div className={`header2 ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="weru2">
          <button className="w-button2">W</button>
          <div className="werus2">
            <h3>WERU HOSTELS</h3>
            <p>A LITTLE MORE CLASS HOME</p>
          </div>
        </div>

        {/* Close button (mobile only) */}
        <div className="close-icon" onClick={closeMenu}>
          ✖
        </div>

        {/* Navigation */}
        <nav className="navs2">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#contact" onClick={closeMenu}>Contact Us</a>
        </nav>

        {/* Auth buttons */}
        <div className="auth-btns2">
          <Link to="/login" className="login" onClick={closeMenu}>
            Login
          </Link>
          <Link to="/register" className="signup" onClick={closeMenu}>
            Sign up
          </Link>
        </div>
      </div>

      {/* Hamburger button (mobile only) */}
      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>
    </header>
  );
}

export default Header;