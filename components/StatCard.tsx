import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subLabel?: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, subLabel, colorClass = "text-indigo-600" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass.replace('text', 'bg')}`}>
          {icon}
        </div>
        {subLabel && <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{subLabel}</span>}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
};

export default StatCard;