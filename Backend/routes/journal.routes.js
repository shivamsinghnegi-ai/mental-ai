const express = require('express');
const { body } = require('express-validator');
const { createEntry, getEntries, updateEntry, deleteEntry } = require('../controllers/journal.controller');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  verifyToken,
  [
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  createEntry
);

router.get('/', verifyToken, getEntries);

router.put(
  '/:id',
  verifyToken,
  [
    body('prompt').optional().trim(),
    body('content').optional().trim(),
  ],
  updateEntry
);

router.delete('/:id', verifyToken, deleteEntry);

module.exports = router;
