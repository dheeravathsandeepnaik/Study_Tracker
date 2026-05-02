import React, { useContext, useState } from 'react';
import { StudyContext } from '../context/StudyContext';
import { AuthContext } from '../context/AuthContext';
import { Clock, Flame, Book, Plus, Download, AlertTriangle, ListFilter, Calendar, PieChart, Activity, Trophy } from 'lucide-react';
import Charts from '../components/Charts';
import AddSessionModal from '../components/AddSessionModal';
import SessionsList from '../components/SessionsList';
import HeatmapWidget from '../components/HeatmapWidget';
import { toTitleCase } from '../utils/textUtils';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { sessions, analytics, streakData, loading } = useContext(StudyContext);
    const [showAddModal, setShowAddModal] = useState(false);

    if (loading) return <div className="min-h-[80vh] flex items-center justify-center dark:text-white">Loading Dashboard...</div>;

    const handleExport = () => {
        if (!sessions || sessions.length === 0) return;

        const headers = ['Date,Status,Duration(min),Topic,Subject,Reason'];
        const csvRows = sessions.map(s => {
            const date = new Date(s.date).toISOString().split('T')[0];
            return `${date},${s.status || 'Read'},${s.duration},"${s.topic.replace(/"/g, '""')}","${s.subject ? s.subject.replace(/"/g, '""') : ''}","${s.reason ? s.reason.replace(/"/g, '""') : ''}"`;
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(csvRows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "study_sessions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 mb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Hello, {user?.name}! 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your study progress and habits.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleExport}
                        className="flex-1 sm:flex-none bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Session
                    </button>
                </div>
            </div>

            {/* Primary Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Total Time</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {analytics?.totalTime ? `${Math.floor(analytics.totalTime / 60)}h ${analytics.totalTime % 60}m` : '0h 0m'}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-xl">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Study Streak</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-baseline gap-2">
                            {streakData?.currentStreak || 0} <span className="text-sm font-normal text-gray-500">Current</span>
                        </p>
                        <p className="text-xs mt-1 font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 inline-block px-2 py-0.5 rounded">
                            {streakData?.longestStreak || 0} Days Best
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl">
                        <Book className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Read Days</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.readDays || 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Skipped Days</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.skippedDays || 0}</p>
                    </div>
                </div>
            </div>

            {/* Extended Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Monthly Progress</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white flex items-baseline gap-2">
                            {analytics?.monthlyReadDays || 0} <span className="text-sm font-normal text-gray-500">Read</span>
                        </p>
                        <p className="text-xs mt-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-0.5 rounded">
                            {analytics?.monthlySkippedDays || 0} Skipped
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-xl">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Read/Skipped Ratio</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-baseline gap-2">
                            {analytics?.readSkippedRatio || "0:0"}
                        </p>
                        <p className="text-xs mt-1 font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 inline-block px-2 py-0.5 rounded">
                            {analytics?.readPercentage || 0}% Read
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-xl">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Avg Study Time</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-baseline gap-2">
                            {analytics?.averageStudyTime || 0} <span className="text-sm font-normal text-gray-500">m / day</span>
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="p-3 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-xl">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div className="w-full min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide truncate">Best Study Day</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {analytics?.bestStudyDay ? new Date(analytics.bestStudyDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "N/A"}
                        </p>
                        <p className="text-xs mt-1 font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 inline-block px-2 py-0.5 rounded">
                            {analytics?.bestStudyDay ? `${analytics.bestStudyDay.time} mins` : "0 mins"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Secondary Analytics: Reasons */}
            {analytics?.commonReasons && analytics.commonReasons.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <ListFilter className="w-5 h-5 text-gray-400" />
                        Most Common Reasons For Skipping
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {analytics.commonReasons.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{toTitleCase(item.reason)}</span>
                                <span className="bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm text-gray-500 dark:text-gray-400">
                                    {item.count}x
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <HeatmapWidget />

            <Charts />

            <SessionsList />

            {showAddModal && <AddSessionModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
};

export default Dashboard;
