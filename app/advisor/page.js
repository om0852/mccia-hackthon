'use client';

import { useState, useEffect } from 'react';

export default function AdvisorPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const handleAISearch = async (e) => {
    if (e.key !== 'Enter' || !query.trim()) return;
    
    setLoading(true);
    setAiResponse(null);
    setResults([]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await response.json();
      
      if (data.answer) {
        // Robust parsing: Try to split by labels, but fallback to full response if labels are missing
        const responseText = data.answer;
        const detailMatch = responseText.match(/📋 DETAILED ANSWER:([\s\S]*?)(?=📖 LEGAL CITATION:|⚠️ DISCLAIMER:|$)/i);
        const citationMatch = responseText.match(/📖 LEGAL CITATION:([\s\S]*?)(?=⚠️ DISCLAIMER:|$)/i);
        const disclaimerMatch = responseText.match(/⚠️ DISCLAIMER:([\s\S]*?)$/i);

        if (detailMatch || citationMatch) {
          setAiResponse({
            answer: detailMatch ? detailMatch[1].trim() : responseText.split(/📖 LEGAL CITATION:|⚠️ DISCLAIMER:/)[0].trim(),
            citation: citationMatch ? citationMatch[1].trim() : "No specific statutory citations found for this query.",
            disclaimer: disclaimerMatch ? disclaimerMatch[1].trim() : "This is not legal advice. Consult your CA for specific situations."
          });
        } else {
          // Fallback for simple greetings or non-statutory answers
          setAiResponse({
            answer: responseText.trim(),
            citation: "General inquiry - no statutory citation required.",
            disclaimer: "This is not legal advice. Consult your CA for specific situations."
          });
        }
      }

    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-primary">Expert AI Advisor</h2>
        <p className="text-xl text-muted-foreground">Ask anything about GST, Income Tax, PF, ESIC. Citation-backed answers only.</p>
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
            placeholder="Type your question and press Enter (e.g., 'What is the penalty for late PF?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleAISearch}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium animate-pulse">Consulting the AI knowledge base...</p>
          </div>
        ) : aiResponse ? (
          <div className="p-8 rounded-3xl bg-card border border-border shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                <div className="w-2 h-4 bg-primary rounded-full"></div>
                Detailed Answer
              </div>
              <div className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                {aiResponse.answer}
              </div>
            </div>

            <div className="p-6 bg-muted/40 rounded-2xl border border-border space-y-4">
              <div className="flex items-center gap-2 text-secondary font-bold uppercase tracking-widest text-xs">
                <div className="w-2 h-4 bg-secondary rounded-full"></div>
                Statutory Citations
              </div>
              <div className="text-sm font-medium text-muted-foreground whitespace-pre-wrap font-mono">
                {aiResponse.citation}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter italic flex items-center gap-2">
                <span className="text-amber-500 text-sm">⚠️</span> {aiResponse.disclaimer}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-6 rounded-2xl border border-border bg-muted/10 text-sm text-muted-foreground space-y-2">
              <p className="font-bold text-primary uppercase tracking-widest text-[10px]">Try asking</p>
              <p className="italic">"How many r's are in the word 'strawberry'?"</p>
              <p className="italic">"What is the interest rate for late GST payment?"</p>
              <p className="italic">"Threshold for ESIC registration?"</p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-muted/10 text-sm text-muted-foreground flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-bold">AI Active</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest opacity-60">Model: poolside/laguna-xs.2:free</p>
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
