'use client';

import { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendar() {
      const response = await fetch('/api/calendar');
      const data = await response.json();
      setCalendar(data);
      setLoading(false);
    }
    fetchCalendar();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Compliance Calendar</h2>
        <p className="text-muted-foreground">Master schedule for all statutory compliance deadlines.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Compliance Type</th>
                <th className="px-6 py-4 font-semibold">Period</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold">Penalty Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">Loading calendar...</td>
                </tr>
              ) : calendar.map((item, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{item.compliance_type}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.frequency}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.period}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-primary">{item.due_date}</span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-xs text-muted-foreground">{item.applicability_condition}</div>
                    <div className="text-[10px] font-bold text-red-500 mt-1">₹{item.penalty_per_day}/day (Cap: {item.penalty_cap})</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
