import { NextResponse } from "next/server";
import { loadAllContent } from "@/lib/content/load";

export async function GET() {
  const data = loadAllContent();
  return NextResponse.json(data);
}
