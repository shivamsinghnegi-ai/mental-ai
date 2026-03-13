import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button/Button';
import { Card, CardContent } from '../../components/ui/Card/Card';
import styles from './Journal.module.css';

const PROMPTS = [
  "What is one thing you're grateful for today?",
  "Who is someone that made you smile recently?",
  "What's a small win you had this week?",
  "What made you feel proud of yourself today?",
  "Name a simple pleasure you enjoyed today.",
  "What's something beautiful you noticed recently?",
  "Which moment today would you want to relive?",
  "What strength helped you get through today?",
];

const MOCK_PAST_ENTRIES = [
  { id: 1, date: 'Mar 12', text: "I'm grateful for the warm cup of tea my roommate made me this morning. Small gestures make the biggest difference.", prompt: "What is one thing you're grateful for today?" },
  { id: 2, date: 'Mar 11', text: "My sister called me just to check in. It felt so good to know someone cares.", prompt: "Who is someone that made you smile recently?" },
  { id: 3, date: 'Mar 10', text: "I finally finished reading that book I started months ago. Feels like a real accomplishment!", prompt: "What's a small win you had this week?" },
];

export default function JournalPage() {
  const navigate = useNavigate();
  const [entry, setEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptIdx, setPromptIdx] = useState(Math.floor(Math.random() * PROMPTS.length));
  const [showPast, setShowPast] = useState(false);

  const prompt = PROMPTS[promptIdx];

  const cyclePrompt = () => {
    setPromptIdx((promptIdx + 1) % PROMPTS.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Journal entry saved!', { icon: '📝' });
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className={`${styles.container} mesh-bg`}>
      <header className={styles.header}>
        <button onClick={() => navigate('/dashboard')} className={styles.backBtn} aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Gratitude Journal</h1>
      </header>

      <main className={styles.main}>
        {/* Writing Area */}
        <div className={styles.writingColumn}>
          <Card className="glass-panel" style={{ width: '100%' }}>
            <CardContent className={styles.cardContent}>

              <p className={styles.dateLabel}>{todayStr}</p>

              <div className={styles.promptBox}>
                <div className={styles.promptHeader}>
                  <div className={styles.promptLabelRow}>
                    <Sparkles size={16} className={styles.sparkleIcon} />
                    <h2 className={styles.promptLabel}>Today's Prompt</h2>
                  </div>
                  <button onClick={cyclePrompt} className={styles.shuffleBtn} title="Get a different prompt">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <p className={styles.promptText}>{prompt}</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <textarea
                  className={styles.textarea}
                  placeholder="Start writing here... Let your thoughts flow freely."
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />

                <div className={styles.footer}>
                  <span className={styles.wordCount}>
                    {entry.trim().split(/\s+/).filter(w => w.length > 0).length} words
                  </span>
                  <Button
                    type="submit"
                    disabled={!entry.trim() || isSubmitting}
                    className={`${styles.submitBtn} hover-lift`}
                  >
                    {isSubmitting ? 'Saving...' : (
                      <>
                        <span>Save Entry</span>
                        <Send size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </form>

            </CardContent>
          </Card>

          {/* Toggle past entries on mobile / always show on desktop */}
          <button className={styles.pastToggle} onClick={() => setShowPast(!showPast)}>
            <BookOpen size={18} />
            <span>{showPast ? 'Hide' : 'Show'} Past Entries</span>
          </button>
        </div>

        {/* Past Entries Sidebar */}
        <div className={`${styles.pastColumn} ${showPast ? styles.pastVisible : ''}`}>
          <h3 className={styles.pastTitle}>Recent Entries</h3>
          <div className={styles.pastList}>
            {MOCK_PAST_ENTRIES.map(e => (
              <Card key={e.id} className={`${styles.pastCard} hover-lift`}>
                <CardContent className={styles.pastCardContent}>
                  <span className={styles.pastDate}>{e.date}</span>
                  <p className={styles.pastPrompt}>{e.prompt}</p>
                  <p className={styles.pastText}>{e.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
