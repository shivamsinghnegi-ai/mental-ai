const crypto = require('crypto');
const Message = require('../models/Message');
const MoodLog = require('../models/MoodLog');
const User = require('../models/User');
const { getChatResponse } = require('../services/gemini.service');
const { detectCrisisKeywords, getCrisisLevel } = require('../utils/crisisDetector');
const { moodWordToScore } = require('../utils/moodMapper');

// ─── POST /api/chat/message ──────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    // 1. Extract inputs
    const { message, conversationHistory = [], sessionId } = req.body;
    const userId = req.user._id;

    // 2. Validate message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required.',
      });
    }
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long. Please keep it under 1000 characters.',
      });
    }

    // 3. Run keyword crisis scan FIRST (before Gemini)
    const keywordResult = detectCrisisKeywords(message);

    // 4. Save user message to MongoDB
    const activeSessionId = sessionId || crypto.randomUUID();
    await Message.create({
      userId,
      sessionId: activeSessionId,
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // 5. Call Gemini service
    const aiResponse = await getChatResponse(message, conversationHistory);

    // 6. Calculate final crisis score (highest of AI vs keywords)
    const finalCrisisScore = getCrisisLevel(
      aiResponse.crisis_score,
      keywordResult.severity
    );

    // 7. Save AI message to MongoDB
    await Message.create({
      userId,
      sessionId: activeSessionId,
      role: 'assistant',
      content: aiResponse.message,
      crisisScore: finalCrisisScore,
      moodDetected: aiResponse.mood_detected,
      copingTip: aiResponse.coping_tip,
      timestamp: new Date(),
    });

    // Log crisis scores >= 4 for monitoring
    if (finalCrisisScore >= 4) {
      console.warn(
        `[CRISIS] userId=${userId} score=${finalCrisisScore} time=${new Date().toISOString()} reason=${keywordResult.reason || 'AI assessment'}`
      );
    }

    // 8. Auto-log mood if detected and not neutral
    if (aiResponse.mood_detected && aiResponse.mood_detected !== 'neutral') {
      await MoodLog.create({
        userId,
        score: moodWordToScore(aiResponse.mood_detected),
        source: 'chat',
        timestamp: new Date(),
      });
    }

    // 9. Update user stats
    await User.findByIdAndUpdate(
      userId,
      {
        lastActiveDate: new Date(),
        $inc: {
          totalSessions: sessionId ? 0 : 1,
        },
      },
      { new: true }
    );

    // 10. Return response to client
    return res.status(200).json({
      success: true,
      data: {
        message: aiResponse.message,
        crisisScore: finalCrisisScore,
        moodDetected: aiResponse.mood_detected,
        copingTip: aiResponse.coping_tip,
        sessionId: activeSessionId,
        isCrisis: finalCrisisScore >= 4,
        wasFallback: aiResponse.error || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/chat/history ───────────────────────────────────────
exports.getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({ userId })
      .sort({ timestamp: 1 }) // ascending
      .lean();

    // Group by sessionId
    const sessionsMap = {};
    for (const msg of messages) {
      if (!sessionsMap[msg.sessionId]) {
        sessionsMap[msg.sessionId] = [];
      }
      sessionsMap[msg.sessionId].push(msg);
    }

    const sessions = Object.entries(sessionsMap).map(([sid, msgs]) => ({
      sessionId: sid,
      messages: msgs,
    }));

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/chat/sessions ──────────────────────────────────────
exports.getChatSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({ userId })
      .sort({ timestamp: 1 })
      .lean();

    const sessionMap = {};
    for (const msg of messages) {
      if (!sessionMap[msg.sessionId]) {
        sessionMap[msg.sessionId] = [];
      }
      sessionMap[msg.sessionId].push(msg);
    }

    const sessions = Object.entries(sessionMap)
      .map(([sid, msgs]) => {
        const firstUserMsg = msgs.find((m) => m.role === 'user');
        const firstAiMsg = msgs.find((m) => m.role === 'assistant');
        const date = msgs[0]?.timestamp || new Date();

        return {
          sessionId: sid,
          preview: firstUserMsg ? firstUserMsg.content.substring(0, 80) : '',
          messageCount: msgs.length,
          date,
          moodDetected: firstAiMsg?.moodDetected || null,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20);

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};
