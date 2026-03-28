const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 0 },
    topic: { type: String, default: '', lowercase: true, trim: true },
    subject: { type: String, lowercase: true, trim: true },
    status: { type: String, enum: ['Read', 'Not Read'], default: 'Read', required: true },
    reason: { type: String, lowercase: true, trim: true }
});

module.exports = mongoose.model('StudySession', StudySessionSchema);
