import { parseCSV } from "../../../lib/data-loader";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = parseCSV('compliance_calendar_master.csv');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
