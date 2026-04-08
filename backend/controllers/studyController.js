const StudySession = require('../models/StudySession');
const { normalizeText } = require('../utils/textUtils');

exports.getSessions = async (req, res) => {
    try {
        const sessions = await StudySession.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addSession = async (req, res) => {
    try {
        const { date, duration, topic, subject, status, reason } = req.body;

        if (status === 'Not Read' && (!reason || reason.trim() === '')) {
            return res.status(400).json({ msg: 'Reason is required when status is Not Read' });
        }
        if (status === 'Read' && (duration === undefined || !topic)) {
            return res.status(400).json({ msg: 'Duration and Topic are required when status is Read' });
        }

        const newSession = new StudySession({
            userId: req.user.id,
            date,
            duration: status === 'Not Read' ? 0 : duration,
            topic: status === 'Not Read' ? 'skipped' : normalizeText(topic),
            subject: normalizeText(subject),
            status: status || 'Read',
            reason: status === 'Not Read' ? normalizeText(reason) : undefined
        });

        const session = await newSession.save();
        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { date, duration, topic, subject, status, reason } = req.body;
        let session = await StudySession.findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Session not found' });
        if (session.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        if (status === 'Not Read' && (!reason || reason.trim() === '')) {
            return res.status(400).json({ msg: 'Reason is required when status is Not Read' });
        }
        if (status === 'Read' && (duration === undefined || !topic)) {
            return res.status(400).json({ msg: 'Duration and Topic are required when status is Read' });
        }

        const updateFields = {
            date,
            duration: status === 'Not Read' ? 0 : duration,
            topic: status === 'Not Read' ? 'skipped' : normalizeText(topic),
            subject: normalizeText(subject),
            status: status || 'Read',
            reason: status === 'Not Read' ? normalizeText(reason) : undefined
        };

        session = await StudySession.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
        res.json(session);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteSession = async (req, res) => {
    try {
        let session = await StudySession.findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Session not found' });
        if (session.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await StudySession.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Session removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const sessions = await StudySession.find({ userId: req.user.id });

        const readSessions = sessions.filter(s => s.status !== 'Not Read');
        const skippedSessions = sessions.filter(s => s.status === 'Not Read');

        const totalTime = readSessions.reduce((acc, curr) => acc + curr.duration, 0);

        const topicBreakdown = readSessions.reduce((acc, curr) => {
            const t = curr.topic ? curr.topic : 'unknown';
            if (t !== 'skipped') {
                acc[t] = (acc[t] || 0) + curr.duration;
            }
            return acc;
        }, {});

        const topicData = Object.keys(topicBreakdown).map(topic => ({
            name: topic,
            value: topicBreakdown[topic]
        }));

        const dailyProgressMap = readSessions.reduce((acc, curr) => {
            const dateStr = new Date(curr.date).toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + curr.duration;
            return acc;
        }, {});
        const dailyProgress = Object.keys(dailyProgressMap)
            .sort()
            .map(date => ({ date, duration: dailyProgressMap[date] }));

        const readDays = new Set(readSessions.map(s => {
            return s.date ? new Date(s.date).toISOString().split('T')[0] : null;
        }).filter(Boolean)).size;

        const skippedDays = new Set(skippedSessions.map(s => {
            return s.date ? new Date(s.date).toISOString().split('T')[0] : null;
        }).filter(Boolean)).size;

        const reasonCounts = skippedSessions.reduce((acc, curr) => {
            const r = curr.reason || 'unknown';
            acc[r] = (acc[r] || 0) + 1;
            return acc;
        }, {});

        const commonReasons = Object.entries(reasonCounts)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            totalTime,
            topicBreakdown: topicData,
            dailyProgress,
            readDays,
            skippedDays,
            commonReasons
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStreak = async (req, res) => {
    try {
        const sessions = await StudySession.find({ userId: req.user.id });
        const readSessions = sessions.filter(s => s.status !== 'Not Read');

        const uniqueDates = [...new Set(readSessions.map(s => {
            const d = new Date(s.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))].sort((a, b) => new Date(b) - new Date(a));

        let currentStreak = 0;
        let longestStreak = 0;

        if (uniqueDates.length > 0) {
            const ascendingDates = [...uniqueDates].reverse();
            let tempStreak = 1;
            longestStreak = 1;

            for (let i = 1; i < ascendingDates.length; i++) {
                const prevDate = new Date(ascendingDates[i - 1]);
                const currDate = new Date(ascendingDates[i]);

                const diffTime = Date.UTC(currDate.getFullYear(), currDate.getMonth(), currDate.getDate()) - Date.UTC(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                    if (tempStreak > longestStreak) longestStreak = tempStreak;
                } else if (diffDays > 1) {
                    tempStreak = 1;
                }
            }

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

            let checkDateStr = todayStr;
            if (!uniqueDates.includes(todayStr) && uniqueDates.includes(yesterdayStr)) {
                checkDateStr = yesterdayStr;
            }

            if (uniqueDates.includes(checkDateStr)) {
                currentStreak = 1;
                let lastFoundIdx = uniqueDates.indexOf(checkDateStr);
                let checkDateObj = new Date(checkDateStr);

                for (let i = lastFoundIdx + 1; i < uniqueDates.length; i++) {
                    checkDateObj.setDate(checkDateObj.getDate() - 1);
                    const expectedDateStr = `${checkDateObj.getFullYear()}-${String(checkDateObj.getMonth() + 1).padStart(2, '0')}-${String(checkDateObj.getDate()).padStart(2, '0')}`;

                    if (uniqueDates[i] === expectedDateStr) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        res.json({ currentStreak, longestStreak });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
