// components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🏠 Hostel Manager
          </Link>
          <div className="nav-menu">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link btn-primary">Register</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          🏠 Hostel Manager
        </Link>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard')}`}
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>

          <Link 
            to="/complaints" 
            className={`nav-link ${isActive('/complaints')}`}
            onClick={closeMobileMenu}
          >
            Complaints
          </Link>

          <Link 
            to="/marketplace" 
            className={`nav-link ${isActive('/marketplace')}`}
            onClick={closeMobileMenu}
          >
            🛒 Marketplace
          </Link>

          <Link 
            to="/groups" 
            className={`nav-link ${isActive('/groups')}`}
            onClick={closeMobileMenu}
          >
            👥 Groups
          </Link>

          {isStudent && (
            <Link 
              to="/complaints/new" 
              className={`nav-link ${isActive('/complaints/new')}`}
              onClick={closeMobileMenu}
            >
              + New Complaint
            </Link>
          )}

          {isAdmin && (
            <Link 
              to="/admin" 
              className={`nav-link ${isActive('/admin')}`}
              onClick={closeMobileMenu}
            >
              Admin Panel
            </Link>
          )}

          <div className="nav-user">
            <Link 
              to="/profile" 
              className="user-info"
              onClick={closeMobileMenu}
            >
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        <button 
          className="mobile-menu-icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;