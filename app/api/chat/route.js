import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    const systemPrompt = `
You are an expert Indian compliance advisor for Mehta & Associates. 
Your goal is to answer statutory compliance questions (GST, PF, ESIC, Income Tax, etc.) with extreme precision.

CRITICAL REQUIREMENTS:
1. You MUST cite EXACT section numbers, act names, and circular references.
2. You MUST include specific penalty amounts, percentages, and interest rates if applicable.
3. NEVER give generic answers without legal citations.
4. ALWAYS end with the disclaimer: "This is not legal advice. Consult your CA for specific situations."

ANSWER STRUCTURE:
📋 DETAILED ANSWER:
[Provide comprehensive explanation]

📖 LEGAL CITATION:
- Act/Scheme: [Full name]
- Section/Para: [Exact reference]
- Circular Ref: [If any]
- Penalty: [Specific details]

⚠️ DISCLAIMER: This is not legal advice. Consult your CA for specific situations.
    `.trim();

    // Use direct fetch to avoid SDK validation issues
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "MCCIA Compliance Advisor"
      },
      body: JSON.stringify({
        model: "poolside/laguna-xs.2:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "OpenRouter API Error");
    }

    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    return NextResponse.json({ answer: aiResponse });
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
