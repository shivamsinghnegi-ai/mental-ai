import React, { useState } from 'react';
import { Calendar, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card/Card';
import styles from './History.module.css';

const mockSessions = [
  {
    id: '1',
    date: '2026-03-12T14:30:00Z',
    mood: { emoji: '😟', label: 'Bad' },
    preview: "I've been feeling really overwhelmed at work lately...",
    messages: [
      { sender: 'user', text: "I've been feeling really overwhelmed at work lately..." },
      { sender: 'ai', text: "I hear you. Work stress can definitely build up. Can you tell me what the most overwhelming part is right now?" }
    ]
  },
  {
    id: '2',
    date: '2026-03-10T09:15:00Z',
    mood: { emoji: '🙂', label: 'Good' },
    preview: "I finally finished that big project I was worried about.",
    messages: [
      { sender: 'user', text: "I finally finished that big project I was worried about." },
      { sender: 'ai', text: "That is fantastic news! You must feel so relieved. How are you celebrating?" }
    ]
  }
];

export default function HistoryPage() {
  const [selectedSession, setSelectedSession] = useState(null);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric'
    });
  };
  
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your History</h1>
        <p className={styles.subtitle}>Review your past check-ins and conversations</p>
      </header>

      <div className={styles.list}>
        {mockSessions.map((session) => (
          <Card 
            key={session.id} 
            className={styles.sessionCard}
            onClick={() => setSelectedSession(session)}
          >
            <CardContent className={styles.sessionContent}>
              <div className={styles.sessionLeft}>
                <div className={styles.dateBlock}>
                  <Calendar size={16} className={styles.icon} />
                  <span className={styles.dateText}>{formatDate(session.date)} at {formatTime(session.date)}</span>
                </div>
                <p className={styles.preview}>"{session.preview}"</p>
              </div>
              <div className={styles.sessionRight}>
                <div className={styles.moodBadge} title={`Mood: ${session.mood.label}`}>
                  {session.mood.emoji}
                </div>
                <ChevronRight size={20} className={styles.arrowIcon} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSession && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSession(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{formatDate(selectedSession.date)}</h3>
                <p className={styles.modalSubtitle}>{formatTime(selectedSession.date)}</p>
              </div>
              <button 
                className={styles.closeBtn} 
                onClick={() => setSelectedSession(null)}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {selectedSession.messages.map((msg, idx) => (
                <div key={idx} className={`${styles.bubbleWrapper} ${msg.sender === 'user' ? styles.wrapperUser : styles.wrapperAi}`}>
                  <div className={`${styles.bubble} ${msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
