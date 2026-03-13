import React, { useState, useEffect } from 'react';
import { X, Phone } from 'lucide-react';
import styles from './CrisisBanner.module.css';

export default function CrisisBanner({ score }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (score >= 4) {
      setIsVisible(true);
    }
  }, [score]);

  if (!isVisible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Phone className={styles.icon} size={20} />
          <p className={styles.text}>
            We noticed you might be struggling. You're not alone. 
            <strong> 988 Suicide & Crisis Lifeline</strong> — Call or text 988
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)} 
          className={styles.closeBtn}
          aria-label="Dismiss banner"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
