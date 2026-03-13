import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageCircle, History, Flame, Activity, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/authStore';
import MoodEmoji from '../../components/MoodEmoji/MoodEmoji';
import { Card, CardContent } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import styles from './Dashboard.module.css';

// Mock data for the chart
const mockChartData = [
  { day: 'Mon', score: 6 },
  { day: 'Tue', score: 5 },
  { day: 'Wed', score: 7 },
  { day: 'Thu', score: 8 },
  { day: 'Fri', score: 6 },
  { day: 'Sat', score: 9 },
  { day: 'Sun', score: 8 },
];

const AFFIRMATIONS = [
  "You are capable of amazing things.",
  "Take a deep breath. You're doing great.",
  "Your potential to succeed is infinite.",
  "Every day is a fresh start.",
  "Embrace the glorious mess that you are.",
  "You are stronger than you think."
];

const MOOD_TAGS = ['Work', 'Family', 'Health', 'Sleep', 'Weather', 'Social', 'Finance'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleMoodSelect = async (val) => {
    setSelectedMood(val);
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      toast.success('Mood logged successfully!');
    } catch {
      toast.error('Failed to log mood');
    } finally {
      setIsSubmitting(false);
      setSelectedMood(null);
      setSelectedTags([]); // reset after submitting
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  return (
    <div className={`${styles.container} mesh-bg`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{getGreeting()}, {user?.name || 'Friend'}</h1>
          <p className={styles.date}>{today}</p>
        </div>
      </header>

      {/* Daily Affirmation */}
      <section className={styles.section}>
        <Card className="glass-panel hover-lift">
          <CardContent className={styles.affirmationContent}>
            <p className={styles.affirmationText}>"{affirmation}"</p>
          </CardContent>
        </Card>
      </section>

      {/* Mood Check-in Strip */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How are you feeling today?</h2>
        <Card>
          <CardContent className={styles.moodCardContent}>
            <MoodEmoji 
              value={selectedMood} 
              onSelect={handleMoodSelect} 
            />
            
            {/* Expanded tags when a mood is selected */}
            {selectedMood && (
              <div className={styles.tagsArea}>
                <p className={styles.tagsLabel}>What's affecting your mood?</p>
                <div className={styles.tagsList}>
                  {MOOD_TAGS.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`${styles.tagBtn} ${selectedTags.includes(tag) ? styles.tagActive : ''}`}
                      disabled={isSubmitting}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleMoodSubmit} 
                  disabled={isSubmitting}
                  className={styles.moodSubmitBtn}
                >
                  {isSubmitting ? 'Saving...' : 'Save Check-in'}
                </Button>
              </div>
            )}
            
            {isSubmitting && <div className={styles.loaderLine}></div>}
          </CardContent>
        </Card>
      </section>

      {/* Stats Row */}
      <section className={styles.statsRow}>
        <Card className={`${styles.statCard} glass-panel hover-lift`}>
          <CardContent className={styles.statContent}>
            <Flame className={styles.statIcon} style={{ color: '#F59E0B' }} />
            <div>
              <p className={styles.statValue}>7 days</p>
              <p className={styles.statLabel}>Current streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`${styles.statCard} glass-panel hover-lift`}>
          <CardContent className={styles.statContent}>
            <Activity className={styles.statIcon} style={{ color: 'var(--primary)' }} />
            <div>
              <p className={styles.statValue}>7.0</p>
              <p className={styles.statLabel}>Avg mood</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`${styles.statCard} glass-panel hover-lift`}>
          <CardContent className={styles.statContent}>
            <CalendarDays className={styles.statIcon} style={{ color: '#3B82F6' }} />
            <div>
              <p className={styles.statValue}>12</p>
              <p className={styles.statLabel}>Sessions</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Actions */}
      <section className={styles.actionRow}>
        <Button 
          size="lg" 
          className={`${styles.actionBtnPrimary} hover-lift`}
          onClick={() => navigate('/chat')}
        >
          <MessageCircle className={styles.actionIcon} />
          <div>
            <span className={styles.actionTitle}>Chat with AI</span>
            <span className={styles.actionSub}>Your safe space to talk</span>
          </div>
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className={`${styles.actionBtnOutline} hover-lift glass-panel`}
          onClick={() => navigate('/history')}
        >
          <History className={styles.actionIcon} />
          <span className={styles.actionTitle}>View History</span>
        </Button>
      </section>

      {/* Recharts Chart */}
      <section className={styles.section}>
        <Card>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Mood History</h3>
            <span className={styles.chartSubtitle}>Last 7 days</span>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-light)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 10]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-light)', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--primary)', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Wellness Tips */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your plan for today</h2>
        <div className={styles.tipsList}>
          <Card className={`${styles.tipCard} hover-lift`} onClick={() => navigate('/breathe')} style={{ cursor: 'pointer' }}>
            <CardContent className={styles.tipContent}>
              <div className={styles.tipIconWrapper} style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                <Activity size={20} />
              </div>
              <div className={styles.tipText}>
                <h4 className={styles.tipTitle}>Breathing Exercise</h4>
                <p className={styles.tipDesc}>Take 3 slow, deep breaths to center yourself.</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${styles.tipCard} hover-lift`} onClick={() => navigate('/meditate')} style={{ cursor: 'pointer' }}>
            <CardContent className={styles.tipContent}>
              <div className={styles.tipIconWrapper} style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <Flame size={20} />
              </div>
              <div className={styles.tipText}>
                <h4 className={styles.tipTitle}>Mindful Meditation</h4>
                <p className={styles.tipDesc}>5 minutes of focusing purely on the present moment.</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${styles.tipCard} hover-lift`} onClick={() => navigate('/journal')} style={{ cursor: 'pointer' }}>
            <CardContent className={styles.tipContent}>
              <div className={styles.tipIconWrapper} style={{ backgroundColor: '#F3E8FF', color: '#7E22CE' }}>
                <CalendarDays size={20} />
              </div>
              <div className={styles.tipText}>
                <h4 className={styles.tipTitle}>Gratitude Journaling</h4>
                <p className={styles.tipDesc}>Write down one thing you appreciate today.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className={styles.bottomSpacer} />
    </div>
  );
}
