import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Check, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import MoodEmoji, { MOODS } from '../../components/MoodEmoji/MoodEmoji';
import styles from './MoodLog.module.css';

export default function MoodLogPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(5);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive which emoji is closest to the current slider score
  const getClosestEmojiValue = (currentScore) => {
    return MOODS.reduce((prev, curr) => 
      Math.abs(curr.value - currentScore) < Math.abs(prev.value - currentScore) ? curr : prev
    ).value;
  };

  const handleEmojiSelect = (val) => {
    setScore(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/mood', { score, note });

      toast.success('Mood logged successfully', {
        icon: '🌱',
      });
      navigate('/dashboard');
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to log mood. Please try again.';
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/dashboard')} className={styles.backBtn} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Log your mood</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Card className={styles.card}>
          <CardContent className={styles.content}>
            
            <div className={styles.section}>
              <h2 className={styles.label}>How are you feeling right now?</h2>
              <MoodEmoji 
                value={getClosestEmojiValue(score)} 
                onSelect={handleEmojiSelect}
                className={styles.emojiRow}
              />
            </div>

            <div className={styles.section}>
              <div className={styles.sliderHeader}>
                <h2 className={styles.label}>Intensity</h2>
                <span className={styles.scoreDisplay}>{score}/10</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>Very Bad</span>
                <span>Neutral</span>
                <span>Great</span>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.label}>Add a note (optional)</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's making you feel this way?"
                className={styles.textarea}
                rows={4}
              />
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className={styles.submitBtn} 
              disabled={isSubmitting}
            >
              <Check size={20} />
              {isSubmitting ? 'Saving...' : 'Save check-in'}
            </Button>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
