const { validationResult } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');

// POST /api/journal
exports.createEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array().map((e) => e.msg).join(', ') });
    }

    const { prompt, content } = req.body;
    const userId = req.user._id;

    const entry = await JournalEntry.create({
      userId,
      prompt: prompt || '',
      content: content || '',
    });

    res.status(201).json({
      success: true,
      entry: {
        id: entry._id,
        prompt: entry.prompt,
        content: entry.content,
        date: entry.date,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/journal
exports.getEntries = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const entries = await JournalEntry.find({ userId })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      entries: entries.map((e) => ({
        id: e._id,
        prompt: e.prompt,
        content: e.content,
        date: e.date,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/journal/:id
exports.updateEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array().map((e) => e.msg).join(', ') });
    }

    const { id } = req.params;
    const { prompt, content } = req.body;
    const userId = req.user._id;

    const entry = await JournalEntry.findOneAndUpdate(
      { _id: id, userId },
      { ...(prompt !== undefined && { prompt }), ...(content !== undefined && { content }) },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found.' });
    }

    res.status(200).json({
      success: true,
      entry: {
        id: entry._id,
        prompt: entry.prompt,
        content: entry.content,
        date: entry.date,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/journal/:id
exports.deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const entry = await JournalEntry.findOneAndDelete({ _id: id, userId });

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found.' });
    }

    res.status(200).json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
};
