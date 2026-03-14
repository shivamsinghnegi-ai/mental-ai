import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, RefreshCw, BookOpen, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button/Button';
import { Card, CardContent } from '../../components/ui/Card/Card';
import api from '../../api/axios';
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

const formatEntryDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function JournalPage() {
  const navigate = useNavigate();
  const [entry, setEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptIdx, setPromptIdx] = useState(Math.floor(Math.random() * PROMPTS.length));
  const [showPast, setShowPast] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const prompt = PROMPTS[promptIdx];

  const fetchEntries = async () => {
    try {
      const res = await api.get('/journal');
      setPastEntries(res.data?.entries || []);
    } catch {
      setPastEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const cyclePrompt = () => {
    setPromptIdx((promptIdx + 1) % PROMPTS.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/journal', { prompt, content: entry.trim() });
      toast.success('Journal entry saved!', { icon: '📝' });
      setEntry('');
      fetchEntries();
    } catch {
      toast.error('Failed to save entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditContent(e.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = async () => {
    if (editingId == null || !editContent.trim()) return;
    setSavingEdit(true);
    try {
      await api.put(`/journal/${editingId}`, { content: editContent.trim() });
      toast.success('Entry updated.');
      setEditingId(null);
      setEditContent('');
      fetchEntries();
    } catch {
      toast.error('Failed to update entry.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/journal/${id}`);
      toast.success('Entry deleted.');
      setPastEntries((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) cancelEdit();
    } catch {
      toast.error('Failed to delete entry.');
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
            {loadingEntries ? (
              <p className={styles.pastText}>Loading...</p>
            ) : pastEntries.length === 0 ? (
              <p className={styles.pastText}>No entries yet. Write your first one above.</p>
            ) : (
              pastEntries.map((e) => (
                <Card key={e.id} className={`${styles.pastCard} hover-lift`}>
                  <CardContent className={styles.pastCardContent}>
                    <div className={styles.pastEntryHeader}>
                      <span className={styles.pastDate}>{formatEntryDate(e.date)}</span>
                      <div className={styles.pastActions}>
                        <button
                          type="button"
                          className={styles.pastActionBtn}
                          onClick={() => startEdit(e)}
                          aria-label="Edit entry"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className={styles.pastActionBtn}
                          onClick={() => handleDelete(e.id)}
                          aria-label="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className={styles.pastPrompt}>{e.prompt}</p>
                    {editingId === e.id ? (
                      <div className={styles.editBlock}>
                        <textarea
                          className={styles.editTextarea}
                          value={editContent}
                          onChange={(ev) => setEditContent(ev.target.value)}
                          disabled={savingEdit}
                          rows={3}
                        />
                        <div className={styles.editActions}>
                          <Button type="button" size="sm" onClick={saveEdit} disabled={savingEdit || !editContent.trim()}>
                            {savingEdit ? 'Saving...' : 'Save'}
                          </Button>
                          <button type="button" className={styles.cancelBtn} onClick={cancelEdit} disabled={savingEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className={styles.pastText}>{e.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
