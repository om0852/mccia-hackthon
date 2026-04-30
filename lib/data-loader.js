import fs from 'fs';
import path from 'path';

export function parseCSV(filename) {
  const filePath = path.join(process.cwd(), 'public', filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // Simple CSV parser that handles basic quoting
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index];
    });
    return obj;
  });
}

export function parseJSON(filename) {
  const filePath = path.join(process.cwd(), 'public', filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

export function getDashboardStats() {
  const clients = parseCSV('client_profiles.csv');
  const missedLogs = parseCSV('missed_deadlines_log.csv');
  const calendar = parseCSV('compliance_calendar_master.csv');
  
  return {
    totalClients: clients.length,
    missedDeadlines: missedLogs.length,
    upcomingCompliance: calendar.filter(item => {
      const dueDate = new Date(item.due_date);
      const today = new Date();
      return dueDate >= today;
    }).length,
    clientSummary: clients.slice(0, 5),
    recentMissed: missedLogs.slice(0, 5)
  };
}

export function getQAData() {
  return parseCSV('compliance_qa_dataset.csv');
}
