import { prisma } from "@/lib/prisma";
import * as fs from "fs/promises";
import * as path from "path";

const folderPath = path.join(__dirname, "../mc-regions");

const getRegionFiles = async (): Promise<string[]> => {
  try {
    const files = await fs.readdir(folderPath);
    return files.filter((file) => file.endsWith(".mca"));
  } catch (err) {
    console.error("Error reading the folder:", err);
  }
  return [];
};

const insertExistingRegions = async () => {
  const regionFiles = await getRegionFiles();
  for (const file of regionFiles) {
    await prisma.mcRegion.upsert({
      where: { name: file },
      create: { name: file },
      update: {},
    });
  }
  console.log(`Inserted or updated ${regionFiles.length} region files.`);
};

(async () => {
  await insertExistingRegions();
})();
