// components/DashboardHeader.jsx
import React from 'react';

const DashboardHeader = ({ year, onYearChange }) => {
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
            <select
                className="p-2 border rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={year}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
            >
                {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
};


export default DashboardHeader;