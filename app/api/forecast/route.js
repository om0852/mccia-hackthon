import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { client, compliance, daysUntil } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    const systemPrompt = `
You are a Compliance Risk Analyst for Mehta & Associates.
Your goal is to analyze a client's profile and a specific statutory deadline to provide a Risk Score (0-100) and a mitigation strategy.

CONSIDER THESE FACTORS:
1. Days remaining (Closer to deadline = higher risk).
2. Compliance complexity (GST is high, Prof Tax is low).
3. Client profile (MSME manufacturing usually has complex data needs).

OUTPUT FORMAT (JSON):
{
  "risk_score": 85,
  "risk_level": "High/Medium/Low",
  "reasoning": "Brief explanation",
  "strategy": "Actionable advice for the CA firm"
}
    `.trim();

    const userPrompt = `
Analyze risk for:
Client: ${client.client_name} (Business: ${client.business_type})
Compliance: ${compliance.compliance_type}
Days Remaining: ${daysUntil}
    `.trim();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Compliance Forecaster"
      },
      body: JSON.stringify({
        model: "poolside/laguna-xs.2:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices?.[0]?.message?.content);

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("Forecast Error:", error);
    return NextResponse.json({ error: "Failed to generate risk forecast" }, { status: 500 });
  }
}
