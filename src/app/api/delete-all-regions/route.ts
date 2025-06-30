import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  await prisma.mcRegion.deleteMany({});
  return NextResponse.json({ success: true });
}
