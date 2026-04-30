import { parseCSV } from "../../../lib/data-loader";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const missed = parseCSV('missed_deadlines_log.csv');
    const clients = parseCSV('client_profiles.csv');

    const totalPenalty = missed.reduce((sum, item) => sum + parseFloat(item.penalty_amount || 0), 0);
    const affectedClients = new Set(missed.map(m => m.client_id)).size;

    // Pattern Analysis
    const compCounts = {};
    missed.forEach(m => {
      compCounts[m.compliance_type] = (compCounts[m.compliance_type] || 0) + 1;
    });
    const mostMissed = Object.entries(compCounts).sort((a, b) => b[1] - a[1])[0];

    // Root Cause Analysis
    const causes = {
      documentation_delay: { count: 0, examples: [] },
      system_error: { count: 0, examples: [] },
      workload_spike: { count: 0, examples: [] }
    };

    missed.forEach(m => {
      const reason = m.reason_noted.toLowerCase();
      if (reason.includes('doc') || reason.includes('data')) {
        causes.documentation_delay.count++;
        causes.documentation_delay.examples.push(`${m.client_id} - ${m.reason_noted}`);
      } else if (reason.includes('miss') || reason.includes('sheet')) {
        causes.system_error.count++;
        causes.system_error.examples.push(`${m.client_id} - ${m.reason_noted}`);
      } else {
        causes.workload_spike.count++;
        causes.workload_spike.examples.push(`${m.client_id} - ${m.reason_noted}`);
      }
    });

    return NextResponse.json({
      analysis_period: "FY 2023-24",
      total_missed_deadlines: missed.length,
      total_penalty_amount: totalPenalty,
      clients_affected: affectedClients,
      pattern_analysis: {
        most_missed_compliance: {
          compliance_type: mostMissed[0],
          miss_count: mostMissed[1],
          percentage_of_total: ((mostMissed[1] / missed.length) * 100).toFixed(1)
        }
      },
      root_cause_breakdown: causes,
      financial_impact: {
        total_penalties_paid: totalPenalty,
        average_penalty_per_miss: (totalPenalty / missed.length).toFixed(0)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
