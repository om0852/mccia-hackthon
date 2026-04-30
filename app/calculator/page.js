'use client';

import { useState, useEffect } from 'react';
import { calculateDeadline } from '../../lib/deadline-calculator';

export default function CalculatorPage() {
  const [clients, setClients] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [clientsRes, calendarRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/calendar')
      ]);
      setClients(await clientsRes.json());
      setCalendar(await calendarRes.json());
    }
    fetchData();
  }, []);

  const handleCalculate = () => {
    if (!selectedClient || !selectedCompliance) return;
    const calc = calculateDeadline(selectedCompliance, selectedClient, new Date('2026-04-30'));
    setResult(calc);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Compliance Deadline Calculator</h2>
        <p className="text-muted-foreground">Calculate exact due dates considering holidays and client filing frequency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-muted-foreground">Select Client Profile</label>
            <select 
              className="w-full p-3 border border-border rounded-xl bg-muted/20 outline-none focus:ring-2 focus:ring-primary/20"
              onChange={(e) => setSelectedClient(clients.find(c => c.client_id === e.target.value))}
            >
              <option value="">-- Choose Client --</option>
              {clients.map(c => (
                <option key={c.client_id} value={c.client_id}>{c.client_name} ({c.filing_frequency})</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-muted-foreground">Compliance Obligation</label>
            <select 
              className="w-full p-3 border border-border rounded-xl bg-muted/20 outline-none focus:ring-2 focus:ring-primary/20"
              onChange={(e) => setSelectedCompliance(calendar.find(item => item.compliance_type === e.target.value))}
            >
              <option value="">-- Choose Compliance --</option>
              {Array.from(new Set(calendar.map(i => i.compliance_type))).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleCalculate}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Calculate Due Date
          </button>
        </div>

        {result && (
          <div className="animate-in zoom-in-95 fade-in duration-300">
            {!result.applicable ? (
              <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
                  <AlertIcon />
                </div>
                <h3 className="text-xl font-bold text-amber-600">Not Applicable</h3>
                <p className="text-amber-700/80">{result.reason}</p>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-primary text-primary-foreground shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Return Period</p>
                  <p className="text-2xl font-bold">{result.return_period}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Calculated Due Date</p>
                  <p className="text-5xl font-black tracking-tighter">{result.adjusted_due_date}</p>
                  <p className="text-sm font-medium opacity-80">{result.day_of_week}</p>
                </div>

                <div className="pt-4 border-t border-white/20 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Original Date</span>
                    <span className="font-mono">{result.due_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Adjustment</span>
                    <span className="italic">{result.adjustment_reason}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/20">
                    <span className="opacity-70">Days Remaining</span>
                    <span className="text-xl font-bold">{result.days_until_deadline} Days</span>
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold uppercase opacity-60">Estimated Penalties</p>
                  <p className="text-xs leading-relaxed">₹{result.penalty_if_missed.penalty_per_day} per day, capped at ₹{result.penalty_if_missed.penalty_cap}. Interest: 18% p.a.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const AlertIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);
