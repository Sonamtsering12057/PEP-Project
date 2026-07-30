const express = require('express');
const router = express.Router();
const { analyzeSymptoms, analyzeHealthData, chat, getDiseaseKnowledgeBase } = require('../controllers/aiController');

router.post('/chat', chat);           // Multi-turn conversational chat
router.post('/triage', analyzeSymptoms);    // Symptom triage
router.post('/health-analysis', analyzeHealthData); // Health intelligence correlation
router.get('/disease-knowledge-base', getDiseaseKnowledgeBase); // WHO/NIH/CDC Disease Directory

module.exports = router;
