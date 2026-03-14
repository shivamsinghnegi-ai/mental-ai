import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageCircle, History, Flame, Activity, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/authStore';
import MoodEmoji from '../../components/MoodEmoji/MoodEmoji';
import { Card, CardContent } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import api from '../../api/axios';
import styles from './Dashboard.module.css';

function buildChartData(history = []) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const byDate = {};
  history.forEach((h) => {
    if (h.rawDate && h.score != null) byDate[h.rawDate] = h.score;
  });
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const rawDate = `${y}-${m}-${day}`;
    const dayName = dayNames[d.getDay()];
    result.push({
      day: `${dayName} ${d.getDate()}`,
      rawDate,
      score: byDate[rawDate] ?? null,
    });
  }
  return result;
}

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
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ streak: 0, avgMoodThisWeek: 0, totalLogs: 0 });
  const [loadingChart, setLoadingChart] = useState(true);

  const fetchMoodData = useCallback(async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        api.get('/mood/history'),
        api.get('/mood/stats'),
      ]);
      const history = historyRes.data?.history || [];
      setChartData(buildChartData(history));
      const s = statsRes.data?.stats || {};
      setStats({
        streak: s.streak ?? 0,
        avgMoodThisWeek: s.avgMoodThisWeek ?? 0,
        totalLogs: s.totalLogs ?? 0,
      });
    } catch {
      setChartData(buildChartData([]));
    } finally {
      setLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, []);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleMoodSelect = (val) => {
    setSelectedMood(val);
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    setIsSubmitting(true);
    try {
      await api.post('/mood', { score: selectedMood, note: selectedTags.length ? selectedTags.join(', ') : '' });
      toast.success('Mood logged successfully!');
      setSelectedMood(null);
      setSelectedTags([]);
      fetchMoodData();
    } catch {
      toast.error('Failed to log mood');
    } finally {
      setIsSubmitting(false);
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
              <p className={styles.statValue}>{stats.streak} {stats.streak === 1 ? 'day' : 'days'}</p>
              <p className={styles.statLabel}>Current streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`${styles.statCard} glass-panel hover-lift`}>
          <CardContent className={styles.statContent}>
            <Activity className={styles.statIcon} style={{ color: 'var(--primary)' }} />
            <div>
              <p className={styles.statValue}>{stats.avgMoodThisWeek ? stats.avgMoodThisWeek.toFixed(1) : '—'}</p>
              <p className={styles.statLabel}>Avg mood</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`${styles.statCard} glass-panel hover-lift`}>
          <CardContent className={styles.statContent}>
            <CalendarDays className={styles.statIcon} style={{ color: '#3B82F6' }} />
            <div>
              <p className={styles.statValue}>{stats.totalLogs}</p>
              <p className={styles.statLabel}>Mood logs</p>
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

      {/* Recharts Chart - real mood history from API */}
      <section className={styles.section}>
        <Card>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Mood History</h3>
            <span className={styles.chartSubtitle}>Last 7 days</span>
          </div>
          <div className={styles.chartContainer}>
            {loadingChart ? (
              <p className={styles.chartPlaceholder}>Loading...</p>
            ) : chartData.every((d) => d.score == null) ? (
              <p className={styles.chartPlaceholder}>Log your mood above to see your history here.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-light)', fontSize: 11 }} 
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
                    formatter={(value) => (value != null ? [value, 'Mood'] : ['No data', ''])}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    connectNulls={false}
                    dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--primary)', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'var(--primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
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
