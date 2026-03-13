const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  note: {
    type: String,
    default: '',
    maxlength: 500,
  },
  tags: {
    type: [String],
    default: [],
  },
  source: {
    type: String,
    enum: ['chat', 'manual'],
    default: 'manual',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

moodLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('MoodLog', moodLogSchema);
