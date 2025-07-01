import { addToExecutionQueue } from "@/lib/executionQueue";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const regionId = searchParams.get("regionId");

  if (!regionId) {
    return new Response("Region ID is required", { status: 400 });
  }

  addToExecutionQueue(parseInt(regionId));
  return NextResponse.json({ success: true });
}
