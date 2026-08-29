// components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import './Navbar.css';

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    className="theme-toggle"
    aria-label={theme === 'dark' ? 'Switch to light board' : 'Switch to dark board'}
    title={theme === 'dark' ? 'Switch to light board' : 'Switch to dark board'}
  >
    {theme === 'dark' ? (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8L6 18M18 6l1.8-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )}
  </button>
);

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isStudent } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
            <span className="nav-logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="9" r="5" fill="currentColor" />
                <path d="M12 14v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            Hostel Board
          </Link>
          <div className="nav-menu">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link nav-link--primary">Register</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          <span className="nav-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="9" r="5" fill="currentColor" />
              <path d="M12 14v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          Hostel Board
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
            Marketplace
          </Link>

          <Link
            to="/groups"
            className={`nav-link ${isActive('/groups')}`}
            onClick={closeMobileMenu}
          >
            Groups
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

          <ThemeToggle theme={theme} onToggle={toggleTheme} />

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
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {mobileMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
