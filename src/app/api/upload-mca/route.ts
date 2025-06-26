import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import { File } from "buffer";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = Array.from(formData);
  const saveDirectory = join(process.cwd(), "src/mc-regions");

  await fs.mkdir(saveDirectory, { recursive: true });

  for (const [name, file] of files) {
    if (file instanceof File) {
      const filePath = join(saveDirectory, name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);
      await prisma.mcRegion.create({
        data: {
          name: name,
        },
      });
    }
  }

  return NextResponse.json({});
}
