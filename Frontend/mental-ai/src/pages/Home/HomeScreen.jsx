import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../../components/BottomNavBar/BottomNavBar';
import styles from './HomeScreen.module.css';

const FlameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={styles.flameIcon}>
    <path d="M12 2c0 0-3 3-3 8a6 6 0 1 0 12 0c0-5-3-8-3-8s1 2 1 4c0 0-4-3-4-8z"/>
    <path d="M12 12c-1.5 0-3 1.5-3 3a3 3 0 0 0 6 0c0-1.5-1.5-3-3-3z" fill="var(--white)"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default function HomeScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const moods = ['😔', '😕', '😐', '🙂', '😄'];

  useEffect(() => {
    const savedName = localStorage.getItem('mindease_name') || 'Friend';
    setName(savedName);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleTalkClick = () => {
    navigate('/chat');
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollArea}>
        
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>{getGreeting()},</h1>
            <h2 className={styles.name}>{name}</h2>
          </div>
          <div className={styles.profileAvatar}>
            {name.charAt(0).toUpperCase()}
          </div>
        </header>

        <section className={styles.streakCard}>
          <div className={styles.streakInfo}>
            <FlameIcon />
            <span className={styles.streakText}>5 day streak</span>
          </div>
          <span className={styles.streakSubtext}>You're doing great!</span>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>How are you feeling right now?</h3>
          <div className={styles.moodRow}>
            {moods.map((mood, idx) => (
              <button
                key={idx}
                className={`${styles.moodBtn} ${selectedMood === idx ? styles.moodSelected : ''}`}
                onClick={() => setSelectedMood(idx)}
              >
                {mood}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.tipCard}>
            <h4 className={styles.tipTitle}>Today's Tip</h4>
            <p className={styles.tipText}>
              Take a moment to identify one thing you can control right now. Focusing on the present helps ground your anxiety.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <button className={styles.chatCard} onClick={handleTalkClick}>
            <div className={styles.chatCardContent}>
              <h3 className={styles.chatCardTitle}>Talk to MindEase</h3>
              <p className={styles.chatCardSub}>Your AI companion is here</p>
            </div>
            <div className={styles.chatCardIcon}>
              <ArrowRightIcon />
            </div>
          </button>
        </section>

        <div className={styles.bottomSpacer} />
      </div>

      <BottomNavBar />
    </div>
  );
}
