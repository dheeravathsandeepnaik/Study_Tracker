import React, { useState, useContext } from 'react';
import { StudyContext } from '../context/StudyContext';
import { X } from 'lucide-react';
import { normalizeInput } from '../utils/textUtils';

const AddSessionModal = ({ onClose }) => {
    const { addSession } = useContext(StudyContext);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Read');
    const [duration, setDuration] = useState('');
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            setLoading(true);
            await addSession({
                date,
                status,
                duration: status === 'Read' ? Number(duration) : 0,
                topic: status === 'Read' ? normalizeInput(topic) : 'skipped',
                subject: normalizeInput(subject),
                reason: status === 'Not Read' ? normalizeInput(reason) : undefined
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred while adding the session');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Study Session</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                                <input
                                    type="radio"
                                    value="Read"
                                    checked={status === 'Read'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                Read
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                                <input
                                    type="radio"
                                    value="Not Read"
                                    checked={status === 'Not Read'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="text-orange-500 focus:ring-orange-500"
                                />
                                Not Read
                            </label>
                        </div>
                    </div>

                    {status === 'Not Read' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Not Reading</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                                placeholder="e.g. Unwell, Had an urgent meeting..."
                                rows="3"
                                required={status === 'Not Read'}
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                                    placeholder="e.g. 60"
                                    min="1"
                                    required={status === 'Read'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                                    placeholder="e.g. React Hooks"
                                    required={status === 'Read'}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject (Optional)</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            placeholder="e.g. Web Development"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center min-w-[100px] ${status === 'Read' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                            {loading ? 'Saving...' : 'Save Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSessionModal;
