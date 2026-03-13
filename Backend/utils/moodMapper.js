const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Mood Word → Score Map ───────────────────────────────────────
const MOOD_SCORE_MAP = {
  happy: 9,
  hopeful: 7,
  neutral: 5,
  anxious: 4,
  sad: 3,
  overwhelmed: 2,
  angry: 2,
};

/**
 * Convert mood word to numeric score for MongoDB MoodLog.
 * @param {string} moodWord
 * @returns {number}
 */
const moodWordToScore = (moodWord) => {
  if (typeof moodWord !== 'string') return 5;
  const key = moodWord.toLowerCase();
  return MOOD_SCORE_MAP[key] ?? 5; // default neutral
};

/**
 * Convert mood logs to chart data grouped by day of week.
 * Fill missing days with null (not 0 — chart should show gap not zero).
 *
 * @param {Array<{ timestamp: Date, score: number }>} moodLogs
 * @returns {Array<{ day: string, score: number | null }>}
 */
const scoresToChartData = (moodLogs = []) => {
  const totals = {};
  const counts = {};

  for (const log of moodLogs) {
    const date = new Date(log.timestamp);
    if (Number.isNaN(date.getTime())) continue;

    // getDay: 0=Sun..6=Sat → we want Mon..Sun
    const jsDay = date.getDay();
    const index = jsDay === 0 ? 6 : jsDay - 1; // map Sun→6, Mon→0...
    const dayName = DAY_NAMES[index];

    totals[dayName] = (totals[dayName] || 0) + (log.score || 0);
    counts[dayName] = (counts[dayName] || 0) + 1;
  }

  return DAY_NAMES.map((day) => {
    if (!counts[day]) {
      return { day, score: null };
    }
    const avg = totals[day] / counts[day];
    return { day, score: Math.round(avg * 10) / 10 };
  });
};

module.exports = {
  moodWordToScore,
  scoresToChartData,
};
