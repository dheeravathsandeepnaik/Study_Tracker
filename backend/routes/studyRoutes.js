const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, studyController.getSessions);
router.post('/', auth, studyController.addSession);
router.put('/:id', auth, studyController.updateSession);
router.delete('/:id', auth, studyController.deleteSession);
router.get('/analytics', auth, studyController.getAnalytics);
router.get('/streak', auth, studyController.getStreak);

module.exports = router;
