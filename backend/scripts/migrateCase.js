const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StudySession = require('../models/StudySession');
const { normalizeText } = require('../utils/textUtils');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/study_tracker')
    .then(async () => {
        console.log('MongoDB connected for Migration.');
        const sessions = await StudySession.find();
        let updated = 0;

        for (let session of sessions) {
            if (session.topic) session.topic = normalizeText(session.topic);
            if (session.subject) session.subject = normalizeText(session.subject);
            if (session.reason) session.reason = normalizeText(session.reason);
            await session.save();
            updated++;
        }
        console.log(`Migration Complete: Updated ${updated} sessions to lowercase sequences.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
