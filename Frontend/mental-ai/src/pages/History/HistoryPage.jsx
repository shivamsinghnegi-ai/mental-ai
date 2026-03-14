import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card/Card';
import api from '../../api/axios';
import styles from './History.module.css';

const moodToEmoji = (moodDetected) => {
  if (!moodDetected) return { emoji: '💬', label: 'Chat' };
  const m = moodDetected.toLowerCase();
  if (['happy', 'hopeful'].includes(m)) return { emoji: '🙂', label: 'Good' };
  if (['anxious', 'sad', 'overwhelmed', 'angry'].includes(m)) return { emoji: '😟', label: 'Heavy' };
  return { emoji: '😐', label: 'Neutral' };
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chat/history');
        const raw = res.data?.sessions || [];
        const list = raw.map((s) => {
          const msgs = s.messages || [];
          const firstMsg = msgs[0];
          const firstUser = msgs.find((m) => m.role === 'user');
          const firstAi = msgs.find((m) => m.role === 'assistant');
          const date = firstMsg?.timestamp || new Date().toISOString();
          const mood = moodToEmoji(firstAi?.moodDetected);
          return {
            id: s.sessionId,
            date,
            mood: { emoji: mood.emoji, label: mood.label },
            preview: firstUser ? (firstUser.content || '').substring(0, 80) : 'No messages',
            messages: msgs.map((m) => ({
              sender: m.role === 'user' ? 'user' : 'ai',
              text: m.content || '',
            })),
          };
        });
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (!cancelled) setSessions(list);
      } catch {
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchHistory();
    return () => { cancelled = true; };
  }, []);

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
        {loading ? (
          <p className={styles.subtitle}>Loading your chat history...</p>
        ) : sessions.length === 0 ? (
          <p className={styles.subtitle}>No chat history yet. Start a conversation from the Chat page.</p>
        ) : (
        sessions.map((session) => (
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
        )))}
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
