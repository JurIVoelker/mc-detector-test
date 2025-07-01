import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageName = searchParams.get("image");

  if (!imageName) {
    return NextResponse.json(
      { error: "Image name is required" },
      { status: 400 }
    );
  }

  const imagePath = path.join(
    process.cwd(),
    "public",
    "region-screenshots",
    imageName
  );

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png", // Adjust the MIME type if the image format is different
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Image not found or cannot be read" },
      { status: 404 }
    );
  }
}
