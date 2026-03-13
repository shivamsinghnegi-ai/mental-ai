const { validationResult } = require('express-validator');
const MoodLog = require('../models/MoodLog');
const User = require('../models/User');

// POST /api/mood
exports.createMoodLog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array().map(e => e.msg).join(', ') });
    }

    const { score, note, tags } = req.body;

    const moodLog = await MoodLog.create({
      userId: req.user._id,
      score,
      note: note || '',
      tags: tags || [],
      source: 'manual',
    });

    res.status(201).json({ success: true, moodLog });
  } catch (error) {
    next(error);
  }
};

// GET /api/mood/history
exports.getMoodHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await MoodLog.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formatted = logs.map((log) => {
      const date = new Date(log._id);
      return {
        date: dayNames[date.getDay()],
        score: Math.round(log.avgScore * 10) / 10,
        count: log.count,
      };
    });

    res.status(200).json({ success: true, history: formatted });
  } catch (error) {
    next(error);
  }
};

// GET /api/mood/stats
exports.getMoodStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [weekStats] = await MoodLog.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          avgMood: { $avg: '$score' },
          totalLogs: { $sum: 1 },
        },
      },
    ]);

    const lastMood = await MoodLog.findOne({ userId })
      .sort({ timestamp: -1 })
      .lean();

    const user = await User.findById(userId).select('streak').lean();

    res.status(200).json({
      success: true,
      stats: {
        avgMoodThisWeek: weekStats ? Math.round(weekStats.avgMood * 10) / 10 : 0,
        totalLogs: weekStats ? weekStats.totalLogs : 0,
        streak: user?.streak || 0,
        lastMood: lastMood ? { score: lastMood.score, date: lastMood.timestamp } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
