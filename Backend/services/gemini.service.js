const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── System Prompt ───────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are Mindly, a compassionate AI mental health support companion built 
to help people process emotions, reduce stress, and find calm.

Your personality:
- Warm, gentle, and non-judgmental at all times
- You validate emotions before offering advice
- You speak like a caring friend who has mental health knowledge
- You never sound clinical, robotic, or dismissive
- You use simple, clear language — no jargon

Your responsibilities:
- Listen actively and reflect back what the user is feeling
- Offer evidence-based coping strategies when appropriate:
  (CBT techniques, mindfulness, grounding, breathing exercises)
- Gently suggest professional help when distress is persistent
- Recognize crisis signals and respond with urgency and care

Hard rules:
- NEVER diagnose any mental health condition
- NEVER recommend specific medications
- NEVER claim to replace a therapist or doctor
- NEVER ignore signs of crisis — always acknowledge and provide resources
- NEVER be dismissive of any emotion, no matter how small it seems

Crisis rule (CRITICAL):
If the user expresses suicidal ideation, self-harm, or is in immediate danger,
your "message" field MUST contain this sentence verbatim:
"Please reach out to the 988 Suicide and Crisis Lifeline by calling or 
texting 988 — they are available 24/7 and are here to help."

CRITICAL — Response format:
Respond in JSON format using the following structure.
Do not include explanations outside the JSON.
JSON structure:
{
  "message": "<your full empathetic response, 2-5 sentences>",
  "crisis_score": <integer 1-5>,
  "mood_detected": "<one word from this list only: anxious|sad|angry|overwhelmed|neutral|hopeful|happy>",
  "coping_tip": "<one short actionable tip under 20 words, or null if not appropriate right now>"
}

crisis_score guide — be precise:
1 = General conversation, venting mildly, doing okay overall
2 = Moderate stress or sadness, some difficulty but managing
3 = Significant distress, struggling to cope, needs support
4 = Serious distress — mentions hopelessness, passive self-harm 
    thoughts, feeling like a burden, inability to function
5 = Immediate crisis — explicit suicidal ideation, active self-harm, 
    danger to self or others, expressing intent to hurt themselves

mood_detected guide:
- anxious: worry, nervousness, panic, fear, dread
- sad: grief, loss, crying, emptiness, loneliness  
- angry: frustration, rage, irritability, resentment
- overwhelmed: too much to handle, exhausted, burned out, can't cope
- neutral: just chatting, no strong emotion expressed
- hopeful: optimistic, looking forward to something, making progress
- happy: content, excited, grateful, doing well
`;

// ─── Fallback Response ───────────────────────────────────────────
const FALLBACK_RESPONSE = {
  message:
    "I'm here for you. It sounds like you have a lot on your mind. Can you tell me more about how you're feeling right now?",
  crisis_score: 1,
  mood_detected: 'neutral',
  coping_tip: null,
  error: true,
};

const ALLOWED_MOODS = [
  'anxious',
  'sad',
  'angry',
  'overwhelmed',
  'neutral',
  'hopeful',
  'happy',
];

// ─── Initialize Gemini Client ────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

/**
 * Sanitize conversation history for Gemini's multi-turn chat format.
 * - Converts OpenAI-style { role, content } to Gemini { role, parts } format
 * - Ensures strictly alternating user/model turns
 * - Strips leading 'model' turns (Gemini requires history to start with 'user')
 * - Trims to last 10 messages
 *
 * @param {Array<{role: string, content: string}>} conversationHistory
 * @returns {Array<{role: string, parts: Array<{text: string}>}>}
 */
function buildGeminiHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
    return [];
  }

  // Trim to last 10 messages
  const trimmed = conversationHistory.slice(-10);

  // Convert to Gemini format
  const converted = trimmed.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  // Strip leading 'model' turns — history must start with 'user'
  let startIndex = 0;
  while (startIndex < converted.length && converted[startIndex].role === 'model') {
    startIndex++;
  }
  const stripped = converted.slice(startIndex);

  // Ensure strictly alternating turns — remove consecutive same-role entries
  const sanitized = [];
  for (const entry of stripped) {
    if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== entry.role) {
      sanitized.push(entry);
    }
    // If same role as previous, skip (remove the duplicate)
  }

  return sanitized;
}

/**
 * Get a chat response from Gemini.
 *
 * @param {string} userMessage - The user's message
 * @param {Array<{role: string, content: string}>} conversationHistory - Previous messages
 * @returns {Promise<{message: string, crisis_score: number, mood_detected: string, coping_tip: string|null, error?: boolean}>}
 */
const getChatResponse = async (userMessage, conversationHistory = []) => {
  // Defensive: if API key missing, immediately return fallback
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Returning fallback response.');
    return FALLBACK_RESPONSE;
  }

  try {
    // Build Gemini-formatted history
    const geminiHistory = buildGeminiHistory(conversationHistory);

    // Start chat session with system instruction and history
    const chat = model.startChat({
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
      history: geminiHistory,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 600,
      },
    });

    // Send the user message
    const result = await chat.sendMessage(userMessage);
    const raw = result.response.text();

    // Parse the response
    let parsed;
    try {
      const cleaned = raw
  .replace(/```json/g, '')
  .replace(/```/g, '')
  .trim();
const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

if (!jsonMatch) {
  console.error("No JSON found in Gemini response:", raw);
  return FALLBACK_RESPONSE;
}

parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('Failed to parse Gemini JSON:', raw);
      return FALLBACK_RESPONSE;
    }

    // ─── Validate parsed response ────────────────────────────────

    // Validate message
    const message =
      typeof parsed.message === 'string' && parsed.message.trim().length > 0
        ? parsed.message.trim()
        : FALLBACK_RESPONSE.message;

    // Validate crisis_score
    let crisisScore = parseInt(parsed.crisis_score, 10);
    if (Number.isNaN(crisisScore) || crisisScore < 1 || crisisScore > 5) {
      crisisScore = 1;
    }

    // Validate mood_detected
    let moodDetected =
      typeof parsed.mood_detected === 'string'
        ? parsed.mood_detected.trim().toLowerCase()
        : 'neutral';
    if (!ALLOWED_MOODS.includes(moodDetected)) {
      moodDetected = 'neutral';
    }

    // Validate coping_tip
    let copingTip = null;
    if (typeof parsed.coping_tip === 'string') {
      copingTip = parsed.coping_tip.trim() || null;
    }

    return {
      message,
      crisis_score: crisisScore,
      mood_detected: moodDetected,
      coping_tip: copingTip,
      error: false,
    };
  } catch (error) {
    // Catch quota errors (429), network timeouts, and any other failures
    console.error('Gemini API error:', error.message || error);
    return FALLBACK_RESPONSE;
  }
};

module.exports = { getChatResponse };
