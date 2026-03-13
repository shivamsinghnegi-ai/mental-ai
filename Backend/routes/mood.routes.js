const express = require('express');
const { body } = require('express-validator');
const { createMoodLog, getMoodHistory, getMoodStats } = require('../controllers/mood.controller');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  verifyToken,
  [
    body('score')
      .isInt({ min: 1, max: 10 })
      .withMessage('Score must be between 1 and 10'),
    body('note')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Note must be under 500 characters'),
  ],
  createMoodLog
);

router.get('/history', verifyToken, getMoodHistory);
router.get('/stats', verifyToken, getMoodStats);

module.exports = router;
