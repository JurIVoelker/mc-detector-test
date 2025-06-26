import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body || !body.entity || typeof body.isSaved !== "boolean") {
    return new Response("Invalid request body", { status: 400 });
  }

  const data = await prisma.foundEntities.update({
    where: {
      id: body.entity,
    },
    data: {
      isSaved: body.isSaved,
    },
  });

  return NextResponse.json(data);
}
