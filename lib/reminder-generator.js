/**
 * Telegram Compliance Reminder Generator
 * Generates structured, actionable messages based on urgency levels.
 */

export function generateTelegramReminder(data) {
  const {
    client_name,
    compliance_type,
    due_date,
    days_until,
    penalty_per_day,
    penalty_cap,
    return_period,
    ca_firm_name
  } = data;

  let header = "";
  let tone = "";
  let action = "";

  if (days_until === 1) {
    header = "🚨 CRITICAL: DEADLINE TOMORROW";
    tone = "This is a final reminder to avoid immediate statutory penalties.";
    action = "Please upload your documents NOW to ensure timely filing.";
  } else if (days_until <= 7 && days_until > 1) {
    header = "⚠️ URGENT: UPCOMING DEADLINE";
    tone = `The filing deadline for ${compliance_type} is approaching in ${days_until} days.`;
    action = "Please share the required data/Tally export by end of day tomorrow.";
  } else if (days_until < 0) {
    header = "🔴 OVERDUE ALERT: PENALTY ACCRUING";
    tone = `The deadline for ${compliance_type} was ${Math.abs(days_until)} days ago.`;
    action = "Immediate action required. Late fees are being calculated daily.";
  } else {
    header = "📅 COMPLIANCE NOTIFICATION";
    tone = `Upcoming filing for the period ${return_period}.`;
    action = "Please keep your documents ready for the upcoming week.";
  }

  return `
${header}

Dear ${client_name},

${tone}

📌 Details:
• Compliance: ${compliance_type}
• Period: ${return_period}
• Due Date: ${due_date}

💸 Non-Compliance Risk:
• Late Fee: ₹${penalty_per_day} per day
• Max Penalty: ₹${penalty_cap}

✅ Action Required:
${action}

Best regards,
Compliance Team
${ca_firm_name}
  `.trim();
}
