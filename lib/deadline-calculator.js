/**
 * Indian Statutory Compliance Deadline Calculator
 * Implements complex logic for due dates, holidays, and applicability.
 */

export function calculateDeadline(compliance, client, referenceDate = new Date()) {
  const refDate = new Date(referenceDate);
  const currentMonth = refDate.getMonth();
  const currentYear = refDate.getFullYear();

  // 1. Applicability Check
  if (compliance.requires_gst && !client.gstin) {
    return { applicable: false, reason: "Client not registered for GST" };
  }
  if (compliance.frequency === 'Quarterly' && client.filing_frequency === 'Monthly') {
    return { applicable: false, reason: "Client is a monthly filer, quarterly return not applicable" };
  }

  // 2. Period & Due Date Calculation
  let returnPeriod = "";
  let dueDate = new Date();
  
  const compType = compliance.compliance_type.toUpperCase();
  
  if (compType.includes("GSTR-1")) {
    returnPeriod = `${currentMonth + 1}-${currentYear}`;
    if (client.filing_frequency === 'Monthly') {
      dueDate = new Date(currentYear, currentMonth + 1, 11);
    } else {
      // Quarter end handling
      const quarterEndMonth = Math.floor(currentMonth / 3) * 3 + 2;
      dueDate = new Date(currentYear, quarterEndMonth + 1, 13);
      returnPeriod = `Q${Math.floor(currentMonth / 3) + 1}-${currentYear}`;
    }
  } else if (compType.includes("GSTR-3B")) {
    returnPeriod = `${currentMonth + 1}-${currentYear}`;
    if (client.filing_frequency === 'Monthly') {
      dueDate = new Date(currentYear, currentMonth + 1, 20);
    } else {
      dueDate = new Date(currentYear, Math.floor(currentMonth / 3) * 3 + 3, 22); // Assuming Category 1 (Maharashtra)
      returnPeriod = `Q${Math.floor(currentMonth / 3) + 1}-${currentYear}`;
    }
  } else if (compType.includes("PF")) {
    returnPeriod = `${currentMonth + 1}-${currentYear}`;
    dueDate = new Date(currentYear, currentMonth + 1, 15);
  } else if (compType.includes("ESIC")) {
    returnPeriod = `${currentMonth + 1}-${currentYear}`;
    dueDate = new Date(currentYear, currentMonth + 1, 21);
  } else if (compType.includes("TDS")) {
    const quarter = Math.floor(currentMonth / 3);
    const months = [7, 10, 1, 4]; // Jul, Oct, Jan, Apr (next year for Jan/Apr)
    const yearAdj = (quarter >= 2) ? 1 : 0;
    dueDate = new Date(currentYear + yearAdj, months[quarter] - 1, months[quarter] === 4 ? 30 : 31);
    returnPeriod = `Q${quarter + 1}-${currentYear}`;
  }

  // 3. Weekend Handling
  const day = dueDate.getDay(); // 0 = Sunday, 6 = Saturday
  let adjustedDate = new Date(dueDate);
  let adjustmentReason = "Due date falls on a working day";
  
  if (day === 0) { // Sunday
    adjustedDate.setDate(dueDate.getDate() + 1);
    adjustmentReason = "Original date was Sunday, moved to Monday";
  } else if (day === 6) { // Saturday
    adjustedDate.setDate(dueDate.getDate() + 2);
    adjustmentReason = "Original date was Saturday, moved to Monday";
  }

  const daysUntil = Math.ceil((adjustedDate - refDate) / (1000 * 60 * 60 * 24));

  return {
    compliance_type: compliance.compliance_type,
    applicable: true,
    return_period: returnPeriod,
    due_date: dueDate.toISOString().split('T')[0],
    day_of_week: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
    adjusted_due_date: adjustedDate.toISOString().split('T')[0],
    adjustment_reason: adjustmentReason,
    days_until_deadline: daysUntil,
    penalty_if_missed: {
      penalty_per_day: compliance.penalty_per_day || 50,
      penalty_cap: compliance.penalty_cap || 5000,
      interest_rate: "18% p.a."
    }
  };
}
