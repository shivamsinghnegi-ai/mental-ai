import React from 'react';
import styles from './MoodEmoji.module.css';

export const MOODS = [
  { emoji: '😠', value: 1, label: 'Very Bad' },
  { emoji: '😟', value: 3, label: 'Bad' },
  { emoji: '😐', value: 5, label: 'Okay' },
  { emoji: '🙂', value: 7, label: 'Good' },
  { emoji: '😊', value: 9, label: 'Great' }
];

export default function MoodEmoji({ value, onSelect, className = '' }) {
  return (
    <div className={`${styles.container} ${className}`}>
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onSelect(mood.value)}
          className={`${styles.emojiBtn} ${value === mood.value ? styles.selected : ''}`}
          aria-label={mood.label}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}
