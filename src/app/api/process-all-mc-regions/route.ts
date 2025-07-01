import { addAllToExecutionQueue } from "@/lib/executionQueue";
import { NextResponse } from "next/server";

export async function GET() {
  await addAllToExecutionQueue();
  return NextResponse.json({ success: true });
}
