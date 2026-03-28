import React, { useContext } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { StudyContext } from '../context/StudyContext';
import 'react-calendar-heatmap/dist/styles.css';

const HeatmapWidget = () => {
    const { sessions } = useContext(StudyContext);

    if (!sessions || sessions.length === 0) return null;

    const dateMap = sessions.reduce((acc, curr) => {
        const d = new Date(curr.date).toISOString().split('T')[0];
        acc[d] = (acc[d] || 0) + curr.duration;
        return acc;
    }, {});

    const values = Object.keys(dateMap).map(date => ({
        date,
        count: dateMap[date],
    }));

    const today = new Date();
    const endDate = today;
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - 6);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200 mt-6 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Study Activity Heatmap</h3>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[600px]">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        values={values}
                        classForValue={(value) => {
                            if (!value || value.count === 0) {
                                return 'color-empty';
                            }
                            if (value.count < 30) return 'color-scale-1';
                            if (value.count < 60) return 'color-scale-2';
                            if (value.count < 120) return 'color-scale-3';
                            return 'color-scale-4';
                        }}
                        titleForValue={(value) => {
                            return value && value.date ? `${value.date}: ${value.count} mins` : 'No data';
                        }}
                        showWeekdayLabels={true}
                    />
                </div>
            </div>
            <style>{`
        .react-calendar-heatmap .color-empty { fill: #ebedf0; }
        html.dark .react-calendar-heatmap .color-empty { fill: #374151; }
        .react-calendar-heatmap .color-scale-1 { fill: #9be9a8; }
        .react-calendar-heatmap .color-scale-2 { fill: #40c463; }
        .react-calendar-heatmap .color-scale-3 { fill: #30a14e; }
        .react-calendar-heatmap .color-scale-4 { fill: #216e39; }
        text.react-calendar-heatmap-month-label, text.react-calendar-heatmap-weekday-label {
          fill: #6b7280;
          font-size: 10px;
        }
        .react-calendar-heatmap rect:hover {
          stroke: #111;
          stroke-width: 1px;
        }
        html.dark .react-calendar-heatmap rect:hover {
          stroke: #fff;
        }
      `}</style>
        </div>
    );
};

export default HeatmapWidget;
