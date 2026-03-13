import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { Card, CardContent } from '../../components/ui/Card/Card';
import styles from './Meditate.module.css';

export default function MeditatePage() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(300); // Default 5 mins (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const changeDuration = (mins) => {
    setIsActive(false);
    const secs = mins * 60;
    setDuration(secs);
    setTimeLeft(secs);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = ((duration - timeLeft) / duration) * 100;

  return (
    <div className={`${styles.container} mesh-bg`}>
      <header className={styles.header}>
        <button onClick={() => navigate('/dashboard')} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Mindful Meditation</h1>
      </header>

      <main className={styles.main}>
        <Card className="glass-panel hover-lift" style={{ maxWidth: '500px', width: '100%' }}>
          <CardContent className={styles.cardContent}>
            
            <div className={styles.visualsContainer}>
              <div 
                className={`${styles.ambientOrb} ${isActive ? styles.orbActive : ''}`} 
              ></div>
              <h2 className={styles.timeDisplay}>{formatTime(timeLeft)}</h2>
            </div>

            <div className={styles.progressBarBg}>
               <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }}></div>
            </div>

            <div className={styles.controls}>
              <Button size="icon" variant="outline" onClick={resetTimer} className={styles.controlBtn}>
                <RotateCcw size={20} />
              </Button>
              <Button size="lg" onClick={toggleTimer} className={`${styles.playBtn} hover-lift`}>
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </Button>
            </div>

            <div className={styles.durations}>
               <Button variant={duration === 180 ? 'default' : 'outline'} onClick={() => changeDuration(3)}>3 Min</Button>
               <Button variant={duration === 300 ? 'default' : 'outline'} onClick={() => changeDuration(5)}>5 Min</Button>
               <Button variant={duration === 600 ? 'default' : 'outline'} onClick={() => changeDuration(10)}>10 Min</Button>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
