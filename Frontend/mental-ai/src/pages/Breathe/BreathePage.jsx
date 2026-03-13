import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import styles from './Breathe.module.css';

export default function BreathePage() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle', 'inhale', 'hold', 'exhale'
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (isActive) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else {
        // Transition phases
        if (phase === 'idle' || phase === 'exhale') {
          setPhase('inhale');
          setTimeLeft(4); // 4 seconds inhale
        } else if (phase === 'inhale') {
          setPhase('hold');
          setTimeLeft(7); // 7 seconds hold
        } else if (phase === 'hold') {
          setPhase('exhale');
          setTimeLeft(8); // 8 seconds exhale
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isActive, phase, timeLeft]);

  const toggleBreathing = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('idle');
      setTimeLeft(0);
    } else {
      setIsActive(true);
      setPhase('inhale');
      setTimeLeft(4);
    }
  };

  const getInstruction = () => {
    if (!isActive) return "Press Start to begin";
    if (phase === 'inhale') return "Breathe In...";
    if (phase === 'hold') return "Hold...";
    if (phase === 'exhale') return "Breathe Out...";
  };

  return (
    <div className={`${styles.container} mesh-bg`}>
      <header className={styles.header}>
        <button onClick={() => navigate('/dashboard')} className={styles.backBtn} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>4-7-8 Breathing</h1>
      </header>

      <main className={styles.main}>
        <p className={styles.description}>
          A simple technique to reduce anxiety and help you relax. 
          Follow the circle's rhythm.
        </p>

        <div className={styles.circleContainer}>
          {/* Decorative background rings */}
          <div className={`${styles.ring} ${styles.ringOuter}`}></div>
          <div className={`${styles.ring} ${styles.ringInner}`}></div>

          {/* Main animated circle */}
          <div 
            className={`${styles.breathingCircle} ${
              isActive ? styles[phase] : ''
            }`}
          >
            <div className={styles.circleContent}>
              <span className={styles.instruction}>{getInstruction()}</span>
              {isActive && <span className={styles.timer}>{timeLeft}s</span>}
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <Button 
            size="lg" 
            onClick={toggleBreathing} 
            className={`${styles.toggleBtn} hover-lift ${isActive ? styles.stopBtn : ''}`}
          >
            {isActive ? (
              <>
                <Square size={20} fill="currentColor" />
                <span>Stop Exercise</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>Start Exercise</span>
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
