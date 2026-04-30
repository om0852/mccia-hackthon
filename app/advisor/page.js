'use client';

import { useState, useEffect } from 'react';

export default function AdvisorPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [qaData, setQaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/advisor');
      const data = await response.json();
      setQaData(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length < 2) {
      setResults([]);
      return;
    }

    const filtered = qaData.filter(item => 
      item.question.toLowerCase().includes(val.toLowerCase()) ||
      item.answer.toLowerCase().includes(val.toLowerCase())
    );
    setResults(filtered.slice(0, 5));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-primary">Expert Compliance Advisor</h2>
        <p className="text-xl text-muted-foreground">Ask anything about GST, Income Tax, PF, ESIC, and more.</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative flex items-center bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="pl-6 text-muted-foreground">
            <SearchIcon />
          </div>
          <input
            type="text"
            className="w-full p-6 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
            placeholder="Search compliance regulations (e.g., 'GSTR-1 penalty' or 'PF deposit')"
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="space-y-6">
        {results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} className="p-8 rounded-2xl bg-card border border-border shadow-lg hover:border-primary/50 transition-all space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">Q: {item.question}</h3>
              </div>
              
              <div className="space-y-6 border-l-4 border-primary/20 pl-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/60">📋 Detailed Answer</span>
                  <p className="text-lg leading-relaxed">{item.answer}</p>
                </div>

                <div className="space-y-3 bg-muted/30 p-6 rounded-xl border border-border">
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">📖 Legal Citation</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Act/Scheme</p>
                      <p className="font-semibold">{item.source_act}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Section/Para</p>
                      <p className="font-semibold">{item.section_number}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground">Circular/Notification</p>
                      <p className="font-semibold">{item.circular_ref}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter italic">
                  ⚠️ Disclaimer: This is not legal advice. Consult your CA for specific situations.
                </p>
              </div>
            </div>
          ))
        ) : query.length >= 2 ? (
          <div className="text-center py-12 text-muted-foreground">
            No exact match found. Try a different keyword or consult your CA.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl border border-border bg-muted/10 text-sm text-muted-foreground">
              Try searching for: <span className="text-primary font-medium">"GST rate"</span>, <span className="text-primary font-medium">"PF penalty"</span>, or <span className="text-primary font-medium">"ESIC threshold"</span>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/10 text-sm text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Knowledge Base up to date: April 2024
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
