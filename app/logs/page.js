'use client';

import { useState, useEffect } from 'react';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Audit Logs</h2>
        <p className="text-muted-foreground">Historical record of missed deadlines and penalties levied.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-red-500">Client ID</th>
                <th className="px-6 py-4 font-semibold">Compliance</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold">Filed Date</th>
                <th className="px-6 py-4 font-semibold">Penalty</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">Loading audit logs...</td>
                </tr>
              ) : logs.map((log, i) => (
                <tr key={i} className="hover:bg-red-50/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-muted-foreground">{log.client_id}</td>
                  <td className="px-6 py-4 font-medium">{log.compliance_type}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.due_date}</td>
                  <td className="px-6 py-4 font-mono text-xs">{log.filed_date}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-red-500">₹{log.penalty_amount}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{log.days_late} Days Late</div>
                  </td>
                  <td className="px-6 py-4 text-xs italic text-muted-foreground">{log.reason_noted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
