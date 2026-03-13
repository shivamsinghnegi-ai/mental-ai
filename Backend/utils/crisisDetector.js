const normalize = (text) => (text || '').toLowerCase();

// ─── Tiered Crisis Keywords ──────────────────────────────────────

// TIER 5 — immediate danger
const TIER_5_KEYWORDS = [
  'kill myself',
  'end my life',
  'want to die',
  'going to kill',
  'suicide',
  'suicidal',
  'hurt myself',
  'cut myself',
  'overdose',
  'no reason to live',
  'better off dead',
  'want to end it',
];

// TIER 4 — serious distress
const TIER_4_KEYWORDS = [
  'self harm',
  'self-harm',
  'harming myself',
  'dont want to be here',
  "don't want to be here",
  'disappear forever',
  'give up on life',
  'cant go on',
  "can't go on",
  'no point anymore',
  'burden to everyone',
];

// TIER 3 — significant distress
const TIER_3_KEYWORDS = [
  'hopeless',
  'worthless',
  'hate myself',
  'no one cares',
  'completely alone',
  'nothing matters',
  'cant take it anymore',
  "can't take it anymore",
  'breaking down',
  'falling apart',
];

/**
 * Detect crisis keywords in a message.
 * Scans the raw user message as a LOCAL safety net — runs BEFORE Gemini.
 *
 * @param {string} message
 * @returns {{ flagged: boolean, severity: number, reason: string | null }}
 */
const detectCrisisKeywords = (message) => {
  const text = normalize(message);

  // Check Tier 5 first (highest severity)
  for (const word of TIER_5_KEYWORDS) {
    if (text.includes(word)) {
      return { flagged: true, severity: 5, reason: `keyword match: ${word}` };
    }
  }

  // Then Tier 4
  for (const word of TIER_4_KEYWORDS) {
    if (text.includes(word)) {
      return { flagged: true, severity: 4, reason: `keyword match: ${word}` };
    }
  }

  // Then Tier 3
  for (const word of TIER_3_KEYWORDS) {
    if (text.includes(word)) {
      return { flagged: true, severity: 3, reason: `keyword match: ${word}` };
    }
  }

  return { flagged: false, severity: 1, reason: null };
};

/**
 * Get final crisis level using AI score and keyword score.
 * Always returns the HIGHER of the two — never downgrade a crisis.
 *
 * @param {number} aiScore - crisis_score from Gemini
 * @param {number} keywordScore - severity from keyword scanner
 * @returns {number}
 */
const getCrisisLevel = (aiScore, keywordScore) => {
  const a = Number.isFinite(aiScore) ? aiScore : 1;
  const k = Number.isFinite(keywordScore) ? keywordScore : 1;
  return Math.max(a, k);
};

module.exports = {
  detectCrisisKeywords,
  getCrisisLevel,
};
