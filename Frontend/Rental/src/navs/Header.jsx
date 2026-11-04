import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function Header() {

    const [isOpen, setIsOpen]=useState(false)
    const  toggleMenu=()=>setIsopen(!isOpen)

 return (
    <>
    <header className="responsive-header">
        {!isOpen &&(
            <div className="humberger">
                 <span className="span">☰</span>
                  <hr/>
            </div>
           
        )}
        <nav className="close">
          {isOpen &&(
            <div className="close-icon" onClick={toggleMenu}>
                 ✖
            </div>
          )}
         </nav> 
         <div className="header2">
        
        <div className="weru">
            <div clasName="w">
                <button className="w-button">W</button>
            </div>
            <div className="werus">
                 <h3>WERU HOSTELS</h3>
            <p>A LITTLE MORE AT HOME </p>
            </div>
           
        </div>
        <div className="navs">
            <Link to="#">Home</Link>
            <Link to="#">About</Link>
            <Link to="#">Contact Us</Link>
        </div>
        <div className="auth-btns">
            <button className="login">Login</button>
             <button className="signup">Sign up</button>
        </div>
  </div>  

     </header>
    <div className="header">
        
        <div className="weru">
            <div clasName="w">
                <button className="w-button">W</button>
            </div>
            <div className="werus">
                 <h3>WERU HOSTELS</h3>
            <p>A LITTLE MORE AT HOME </p>
            </div>
           
        </div>
        <div className="navs">
            <Link to="#">Home</Link>
            <Link to="#">About</Link>
            <Link to="#">Contact Us</Link>
        </div>
        <div className="auth-btns">
            <button className="login"><Link to="/login">Login</Link></button>
             <button className="signup"><Link to="/register">Sign up</Link></button>
        </div>
  </div>  
    </>
  )
}

export default Header