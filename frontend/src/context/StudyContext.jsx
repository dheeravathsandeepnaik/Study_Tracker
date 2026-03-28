import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [sessions, setSessions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [sessionsRes, analyticsRes, streakRes] = await Promise.all([
                api.get('/study'),
                api.get('/study/analytics'),
                api.get('/study/streak')
            ]);
            setSessions(sessionsRes.data);
            setAnalytics(analyticsRes.data);
            setStreakData(streakRes.data);
        } catch (err) {
            console.error('Error fetching study data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const addSession = async (sessionData) => {
        const res = await api.post('/study', sessionData);
        setSessions([res.data, ...sessions]);
        fetchDashboardData();
    };

    const updateSession = async (id, sessionData) => {
        await api.put(`/study/${id}`, sessionData);
        fetchDashboardData();
    };

    const deleteSession = async (id) => {
        await api.delete(`/study/${id}`);
        fetchDashboardData();
    };

    return (
        <StudyContext.Provider value={{ sessions, analytics, streakData, loading, addSession, updateSession, deleteSession, refreshData: fetchDashboardData }}>
            {children}
        </StudyContext.Provider>
    );
};
