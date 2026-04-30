import { getDashboardStats } from "../lib/data-loader";

export default function Home() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back. Here is what requires your attention today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <ClientsIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
              <h3 className="text-2xl font-bold">{stats.upcomingCompliance}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <AlertIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Missed Deadlines</p>
              <h3 className="text-2xl font-bold">{stats.missedDeadlines}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Clients */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-lg">Active Clients</h3>
          </div>
          <div className="divide-y divide-border">
            {stats.clientSummary.map((client) => (
              <div key={client.client_id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-semibold">
                    {client.client_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{client.client_name}</p>
                    <p className="text-xs text-muted-foreground">{client.business_type} • {client.gstin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {client.filing_frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border bg-muted/10">
            <a href="/clients" className="text-sm text-primary font-medium hover:underline">View all clients →</a>
          </div>
        </div>

        {/* Missed Deadlines */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-lg text-red-500">Critical: Missed Deadlines</h3>
          </div>
          <div className="divide-y divide-border">
            {stats.recentMissed.map((log, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-red-50/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <AlertIcon />
                  </div>
                  <div>
                    <p className="font-medium">{log.compliance_type}</p>
                    <p className="text-xs text-muted-foreground">Client: {log.client_id} • Due: {log.due_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">₹{log.penalty_amount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{log.days_late} Days Late</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border bg-muted/10">
            <a href="/logs" className="text-sm text-primary font-medium hover:underline">View full audit log →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal Icons
const ClientsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-1-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

