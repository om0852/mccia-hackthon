'use client';

import { useState, useEffect } from 'react';
import { generateTelegramReminder } from '../../lib/reminder-generator';

export default function RemindersPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      // For demo, we'll simulate upcoming deadlines based on calendar and clients
      const [clientsRes, calendarRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/calendar')
      ]);
      const clients = await clientsRes.json();
      const calendar = await calendarRes.json();

      // Merge data for demo
      const reminders = calendar.slice(0, 10).map((item, idx) => {
        const client = clients[idx % clients.length];
        const daysUntil = [7, 1, -2, 5, 12][idx % 5];
        return {
          id: idx,
          client_name: client.client_name,
          compliance_type: item.compliance_type,
          due_date: item.due_date,
          days_until: daysUntil,
          penalty_per_day: item.penalty_per_day || 100,
          penalty_cap: item.penalty_cap || 5000,
          return_period: item.period || "Apr 2024",
          ca_firm_name: "Mehta & Associates"
        };
      });

      setUpcoming(reminders.sort((a, b) => a.days_until - b.days_until));
    }
    fetchData();
  }, []);

  const handleGenerate = (reminder) => {
    setSelectedReminder(reminder);
    const msg = generateTelegramReminder(reminder);
    setGeneratedMessage(msg);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    alert("Message copied to clipboard!");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Automated Reminders</h2>
        <p className="text-muted-foreground">Generate urgency-aware Telegram messages for your clients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Upcoming Deadlines (Next 14 Days)
          </h3>
          <div className="space-y-3">
            {upcoming.map(r => (
              <div 
                key={r.id} 
                onClick={() => handleGenerate(r)}
                className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                  selectedReminder?.id === r.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{r.client_name}</p>
                    <p className="text-xs text-muted-foreground">{r.compliance_type} — {r.return_period}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    r.days_until === 1 ? 'bg-red-500 text-white animate-pulse' : 
                    r.days_until <= 7 ? 'bg-amber-500 text-white' : 
                    r.days_until < 0 ? 'bg-black text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {r.days_until < 0 ? 'Overdue' : r.days_until === 1 ? 'Due Tomorrow' : `In ${r.days_until} Days`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-6 bg-secondary rounded-full"></span>
            Telegram Preview
          </h3>
          {generatedMessage ? (
            <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="p-4 bg-muted/30 rounded-2xl font-mono text-sm whitespace-pre-wrap leading-relaxed border border-border">
                {generatedMessage}
              </div>
              <button 
                onClick={copyToClipboard}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <CopyIcon /> Copy for Telegram
              </button>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <p>Select a deadline from the left to generate a reminder.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
