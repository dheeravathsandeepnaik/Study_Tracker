import React, { useContext, useState } from 'react';
import { StudyContext } from '../context/StudyContext';
import { Calendar, Clock, BookOpen, Trash2, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toTitleCase } from '../utils/textUtils';

const SessionsList = () => {
    const { sessions, deleteSession, loading } = useContext(StudyContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    if (loading) return null;

    let filteredSessions = sessions.filter(session => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = session.topic.toLowerCase().includes(term) ||
            (session.subject && session.subject.toLowerCase().includes(term)) ||
            (session.reason && session.reason.toLowerCase().includes(term));

        let matchesDate = true;
        if (dateRange.start) {
            matchesDate = matchesDate && new Date(session.date) >= new Date(dateRange.start);
        }
        if (dateRange.end) {
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59);
            matchesDate = matchesDate && new Date(session.date) <= end;
        }

        return matchesSearch && matchesDate;
    });

    filteredSessions.sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'duration-desc') return b.duration - a.duration;
        if (sortBy === 'duration-asc') return a.duration - b.duration;
        return 0;
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-6 transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Study Sessions</h3>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full relative">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Search</label>
                        <input
                            type="text"
                            placeholder="Search topics or reasons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-8" />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Sort List</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="duration-desc">Longest First</option>
                                <option value="duration-asc">Shortest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {filteredSessions.length > 0 ? (
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Topic / Reason</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredSessions.map((session) => (
                                <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-2 whitespace-nowrap">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {format(new Date(session.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-[200px] truncate" title={session.status === 'Not Read' ? session.reason : session.topic}>
                                        {session.status === 'Not Read' ? (
                                            <span className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                                <AlertCircle className="w-4 h-4" />
                                                {toTitleCase(session.reason)}
                                            </span>
                                        ) : (
                                            toTitleCase(session.topic)
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {session.subject && session.status !== 'Not Read' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-800">
                                                <BookOpen className="w-3 h-3" />
                                                {toTitleCase(session.subject)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {session.status === 'Read' ? (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {session.duration} min
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {session.status === 'Not Read' ? (
                                            <span className="inline-flex px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold">
                                                Skipped
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                                                Read
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this session?')) {
                                                    deleteSession(session._id);
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors inline-block"
                                            title="Delete Session"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No study sessions match your filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionsList;
