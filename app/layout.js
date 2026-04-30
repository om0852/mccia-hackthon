import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MCCIA Compliance Advisor",
  description: "Expert compliance management for GST, Income Tax, and Labor Laws.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-border flex flex-col hidden md:flex">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold tracking-tight text-primary">MCCIA Advisor</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium transition-all hover:bg-primary/20">
              <DashboardIcon /> Dashboard
            </a>
            <a href="/clients" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <ClientsIcon /> Clients
            </a>
            <a href="/calendar" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <CalendarIcon /> Calendar
            </a>
            <a href="/advisor" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <AdvisorIcon /> Expert Advisor
            </a>
            <a href="/returns" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <ReturnsIcon /> GST Returns
            </a>
            <a href="/calculator" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <CalculatorIconNav /> Deadline Calculator
            </a>
            <a href="/circulars" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <CircularsIcon /> GST Circulars
            </a>
            <a href="/reminders" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <ReminderIcon /> Automated Reminders
            </a>
            <a href="/audit" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <AuditIcon /> Compliance Audit
            </a>
            <a href="/logs" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">




              <LogsIcon /> Audit Logs
            </a>

          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground">
              © 2026 MCCIA Compliance
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
            <div className="md:hidden font-bold text-primary">MCCIA Advisor</div>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <SearchIcon />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                JD
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8 bg-background/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

// Minimal Icons
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const ClientsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const AdvisorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M9 9h6"/><path d="M9 13h6"/></svg>
);
const ReturnsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 3 3 3-3"/></svg>
);
const CalculatorIconNav = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="16" y1="10" y2="10"/><line x1="8" x2="16" y1="14" y2="14"/><line x1="8" x2="16" y1="18" y2="18"/></svg>
);
const CircularsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-5Z"/><path d="M8 7h6"/><path d="M8 11h8"/><path d="M8 15h6"/></svg>
);
const ReminderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
);
const AuditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
const LogsIcon = () => (





  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m15 5 3 3"/></svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
