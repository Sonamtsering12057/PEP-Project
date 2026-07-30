const express = require('express');
const router = express.Router();
const { analyzeSymptoms, analyzeHealthData, chat } = require('../controllers/aiController');

router.post('/chat', chat);           // NEW - multi-turn conversational chat
router.post('/triage', analyzeSymptoms);    // kept for backward compat
router.post('/health-analysis', analyzeHealthData);

module.exports = router;
