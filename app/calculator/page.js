'use client';

import { useState, useEffect } from 'react';
import { calculateDeadline } from '../../lib/deadline-calculator';

export default function CalculatorPage() {
  const [clients, setClients] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [result, setResult] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

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
    setAiInsight(null);
  };

  const getAIInsights = async () => {
    if (!result || !selectedClient || !selectedCompliance) return;
    setLoadingAI(true);
    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: selectedClient,
          compliance: selectedCompliance,
          daysUntil: result.days_until_deadline
        })
      });
      const data = await response.json();
      setAiInsight(data);
    } catch (error) {
      console.error("AI Insight Error:", error);
    } finally {
      setLoadingAI(false);
    }
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

                {!aiInsight && (
                  <button 
                    onClick={getAIInsights}
                    disabled={loadingAI}
                    className="w-full py-3 bg-white text-primary rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {loadingAI ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Analyzing Risk...
                      </span>
                    ) : (
                      <>
                        <AIIcon /> Get AI Risk Insights
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {aiInsight && (
              <div className="mt-8 p-8 bg-card border-2 border-primary rounded-3xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                      <AIIcon /> AI Compliance Forecast
                    </div>
                    <h4 className="text-2xl font-black">{aiInsight.risk_level} Risk Level</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Risk Score</p>
                    <p className={`text-4xl font-black ${aiInsight.risk_score > 70 ? 'text-red-600' : 'text-green-600'}`}>
                      {aiInsight.risk_score}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground">AI Reasoning</p>
                    <p className="text-sm leading-relaxed">{aiInsight.reasoning}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-xs font-bold uppercase text-primary mb-1">Recommended Prevention Strategy</p>
                    <p className="text-sm font-medium">{aiInsight.strategy}</p>
                  </div>
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
const AIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

