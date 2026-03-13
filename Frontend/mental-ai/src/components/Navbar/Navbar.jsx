import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/dashboard" className={styles.logo}>
          <div className={styles.logoCircle}></div>
          <span className={styles.logoText}>MindEase</span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link to="/chat" className={styles.navLink}>Chat</Link>
          <Link to="/breathe" className={styles.navLink}>Breathe</Link>
          <Link to="/history" className={styles.navLink}>History</Link>
        </div>

        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Log out">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
