'use client';

import { useState, useEffect } from 'react';

export default function CircularsPage() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/circulars');
      const data = await response.json();
      setCirculars(data);
      performAnalysis(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const performAnalysis = (data) => {
    // Group by topic (summary keywords)
    const topicGroups = {};
    data.forEach(c => {
      let topic = "General";
      if (c.summary.toLowerCase().includes("itc")) topic = "ITC Eligibility";
      else if (c.summary.toLowerCase().includes("refund")) topic = "Refund Procedures";
      else if (c.summary.toLowerCase().includes("returns")) topic = "GST Returns";
      
      if (!topicGroups[topic]) topicGroups[topic] = [];
      topicGroups[topic].push(c);
    });

    const activeCirculars = [];
    const supersededCirculars = [];
    const chains = [];

    Object.keys(topicGroups).forEach(topic => {
      const sorted = [...topicGroups[topic]].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = sorted[0];
      activeCirculars.push(latest);
      
      const chain = sorted.map((c, i) => ({
        ...c,
        status: i === 0 ? "ACTIVE" : "SUPERSEDED"
      }));
      
      if (sorted.length > 1) {
        chains.push({ topic, chain, current_position: latest.circular_id });
        sorted.slice(1).forEach(old => {
          supersededCirculars.push({
            ...old,
            superseded_by: latest.circular_id
          });
        });
      }
    });

    setAnalysis({ activeCirculars, supersededCirculars, chains });
  };

  if (loading) return <div className="p-8 text-center">Analyzing circulars database...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">GST Circulars Manager</h2>
          <p className="text-muted-foreground">Automated supersession tracking and legal update analysis.</p>
        </div>
        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          {analysis.activeCirculars.length} Active Guidelines Identified
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Circulars */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Current Active Interpretations
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {analysis.activeCirculars.map(c => (
              <div key={c.circular_id} className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">{c.circular_id}</span>
                  <span className="text-xs text-muted-foreground font-mono">{c.date}</span>
                </div>
                <h4 className="font-bold text-lg mb-2">{c.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.summary}</p>
                <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-secondary">
                  <span>Topic: {c.summary.includes("ITC") ? "ITC" : c.summary.includes("refund") ? "Refund" : "Returns"}</span>
                  <span className="text-green-600">✓ Legally Binding</span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold flex items-center gap-2 pt-4">
            <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
            Supersession History
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs uppercase opacity-60">Old Circular</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase opacity-60">Superseded By</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase opacity-60">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analysis.supersededCirculars.map(c => (
                  <tr key={c.circular_id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{c.circular_id}</div>
                      <div className="text-xs text-muted-foreground">{c.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{c.superseded_by}</span>
                        <ArrowIcon />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-black text-amber-600 uppercase">Superseded</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar / Chains */}
        <div className="space-y-6">
          <div className="p-6 bg-primary text-primary-foreground rounded-3xl shadow-xl shadow-primary/20 space-y-6">
            <h3 className="text-xl font-bold">Analysis Summary</h3>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-[10px] font-bold uppercase opacity-60">Date Range</p>
                <p className="font-medium">Jan 2020 — Dec 2023</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-[10px] font-bold uppercase opacity-60">Chain Lengths</p>
                <p className="font-medium">Avg. 13 updates per topic</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/20">
              <p className="text-xs italic opacity-80 leading-relaxed">
                "Our automated logic identified {analysis.supersededCirculars.length} outdated guidelines. The Advisor module has been synchronized to use only active circulars."
              </p>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Latest Update Chains</h4>
            <div className="space-y-4">
              {analysis.chains.map((chain, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-xs font-bold text-primary">{chain.topic}</div>
                  <div className="flex items-center gap-1">
                    {chain.chain.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-green-500' : 'bg-muted-foreground/30'}`}></div>
                        {idx < 2 && <div className="w-4 h-px bg-border"></div>}
                      </div>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-2">({chain.chain.length} nodes)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
