'use client';

import { useState, useEffect } from 'react';

export default function AuditPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/audit');
      const result = await response.json();
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Analyzing historical compliance logs...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Audit Specialist</h2>
          <p className="text-muted-foreground">Historical analysis and prevention recommendations for FY 2023-24.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total Impact</p>
          <p className="text-4xl font-black text-red-600">₹{data.total_penalty_amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Most Missed</p>
          <h3 className="text-2xl font-bold text-primary">{data.pattern_analysis.most_missed_compliance.compliance_type}</h3>
          <p className="text-sm text-muted-foreground mt-1">{data.pattern_analysis.most_missed_compliance.miss_count} violations ({data.pattern_analysis.most_missed_compliance.percentage_of_total}%)</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Affected Clients</p>
          <h3 className="text-2xl font-bold text-primary">{data.clients_affected} Clients</h3>
          <p className="text-sm text-muted-foreground mt-1">2 Churned due to repeated misses</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Avg. Penalty / Miss</p>
          <h3 className="text-2xl font-bold text-primary">₹{parseInt(data.financial_impact.average_penalty_per_miss).toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground mt-1">High financial risk per transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Root Cause Analysis */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-6 bg-red-600 rounded-full"></span>
            Root Cause Classification
          </h3>
          <div className="space-y-4">
            {Object.entries(data.root_cause_breakdown).map(([key, value]) => (
              <div key={key} className="p-6 bg-card border border-border rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold capitalize">{key.replace('_', ' ')}</h4>
                  <span className="text-xs font-black px-2 py-1 bg-red-500/10 text-red-600 rounded-lg">{value.count} Instances</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-600 h-full" 
                    style={{ width: `${(value.count / data.total_missed_deadlines) * 100}%` }}
                  ></div>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pt-2">
                  {value.examples.slice(0, 2).map((ex, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-600">•</span> {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Prevention Recommendations */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-6 bg-green-600 rounded-full"></span>
            Prevention Strategy
          </h3>
          <div className="space-y-4">
            <div className="p-6 bg-green-600 text-white rounded-3xl shadow-lg shadow-green-600/20 space-y-4">
              <h4 className="font-bold text-lg">AI Integration ROI</h4>
              <p className="text-sm opacity-90 leading-relaxed">
                By implementing the Automated Deadline Tracker and Tally-to-GSTR Generator, we estimate a 90% reduction in "System Errors" and "Documentation Delays".
              </p>
              <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                <span>Potential Savings</span>
                <span className="text-2xl font-black">₹3.7L / Year</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { title: "14-Day Advance Reminders", desc: "For high-penalty profiles like CL-023", impact: "High" },
                { title: "Automated Data Requests", desc: "Auto-ping clients for Purchase Registers on the 10th", impact: "Critical" },
                { title: "Senior CA Escalation", desc: "Flag missed documents to partners at 3-day mark", impact: "Medium" }
              ].map((rec, i) => (
                <div key={i} className="p-4 border border-border rounded-xl flex items-center justify-between bg-card">
                  <div>
                    <p className="font-bold text-sm">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.desc}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    rec.impact === 'Critical' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'
                  }`}>
                    {rec.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
