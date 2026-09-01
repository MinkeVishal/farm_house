import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🌾
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/farmhouses" className="nav-link">Farm Houses</Link>
          <a href="/#discounts" className="nav-link" style={{ fontWeight: '700', color: '#e11d48' }}>🔥 Deals</a>
          
          {user ? (
            <>
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              {user.role === 'OWNER' && (
                <Link to="/owner-dashboard" className="nav-link">Dashboard</Link>
              )}
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              <span className="user-info">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link login">Login</Link>
              <Link to="/register" className="nav-link register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
