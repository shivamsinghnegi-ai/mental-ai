const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  crisisScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 1,
  },
  moodDetected: {
    type: String,
    default: null,
  },
  copingTip: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
messageSchema.index({ userId: 1, sessionId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
