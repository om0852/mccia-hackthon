'use client';

import { useState, useEffect } from 'react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchClients() {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
      setLoading(false);
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Client Directory</h2>
          <p className="text-muted-foreground">Manage and view compliance profiles for all registered clients.</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <SearchIcon />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-xl bg-card text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search name or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Client Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">GSTIN / PAN</th>
                <th className="px-6 py-4 font-semibold">Filing</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">Loading clients...</td>
                </tr>
              ) : filteredClients.map((client) => (
                <tr key={client.client_id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{client.client_name}</div>
                    <div className="text-xs text-muted-foreground">{client.client_id}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{client.business_type}</td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs">{client.gstin}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{client.pan}</div>
                  </td>
                  <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-wider">{client.filing_frequency}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      ACTIVE
                    </span>
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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
