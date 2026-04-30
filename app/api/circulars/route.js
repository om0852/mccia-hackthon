import { parseJSON } from "../../../lib/data-loader";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = parseJSON('gst_circulars_index.json');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
