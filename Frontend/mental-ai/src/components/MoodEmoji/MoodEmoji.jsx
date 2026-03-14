import React from 'react';
import styles from './MoodEmoji.module.css';

export const MOODS = [
  { value: 1, label: 'Struggling', color: 'low' },
  { value: 3, label: 'Low', color: 'low-mid' },
  { value: 5, label: 'Okay', color: 'mid' },
  { value: 7, label: 'Good', color: 'mid-high' },
  { value: 9, label: 'Great', color: 'high' },
];

export default function MoodEmoji({ value, onSelect, className = '' }) {
  return (
    <div className={`${styles.container} ${className}`}>
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onSelect(mood.value)}
          className={`${styles.moodBtn} ${styles[mood.color]} ${value === mood.value ? styles.selected : ''}`}
          aria-label={mood.label}
          title={mood.label}
        >
          {mood.label}
        </button>
      ))}
    </div>
  );
}
