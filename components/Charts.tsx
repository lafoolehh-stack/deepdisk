import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SomalipinRecord } from '../types';

interface ChartsProps {
  records: SomalipinRecord[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Charts: React.FC<ChartsProps> = ({ records }) => {
  const data = React.useMemo(() => {
    const categories: Record<string, number> = {};
    records.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  }, [records]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribution Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;