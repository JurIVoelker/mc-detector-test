import { execFile } from "child_process";
import { prisma } from "./prisma";

type Vec3 = [number, number, number];
export type FoundBlockSphere = { local: Vec3; world: Vec3; item_id: number };

export const queuedMcRegions: {
  id: number;
  state: "queued" | "processing" | "processed";
}[] = [];

let processing = false;

export function addToExecutionQueue(id: number) {
  queuedMcRegions.push({
    id,
    state: "queued",
  });
  processQueue();
}

async function processQueue() {
  if (processing || queuedMcRegions.length === 0) {
    return;
  }

  processing = true;
  while (queuedMcRegions.some((item) => item.state === "queued")) {
    const nextItem = queuedMcRegions.find((item) => item.state === "queued");
    if (nextItem) {
      try {
        nextItem.state = "processing";
        await prisma.mcRegion.update({
          where: { id: nextItem.id },
          data: { status: "processing" },
        });

        const data = (await executeScript(nextItem.id)) as {
          found_chests: number[][];
          found_shulker_boxes: number[][];
          found_chests_sphere: FoundBlockSphere[];
          found_shulker_boxes_sphere: FoundBlockSphere[];
        };

        const foundChests = data.found_chests.map(
          (chest) => `${chest[0]} ${chest[1]} ${chest[2]}`
        );
        const foundShulkerBoxes = data.found_shulker_boxes.map(
          (box) => `${box[0]} ${box[1]} ${box[2]}`
        );

        await prisma.foundEntities.deleteMany({
          where: { regionId: nextItem.id },
        });

        await prisma.foundEntities.createMany({
          data: foundChests.map((chest, index) => ({
            regionId: nextItem.id,
            data3d: JSON.stringify(data.found_chests_sphere[index]),
            type: "chest",
            data: chest,
          })),
        });

        await prisma.foundEntities.createMany({
          data: foundShulkerBoxes.map((box, index) => ({
            regionId: nextItem.id,
            type: "shulker_box",
            data3d: JSON.stringify(data.found_shulker_boxes_sphere[index]),
            data: box,
          })),
        });

        await prisma.mcRegion.update({
          where: { id: nextItem.id },
          data: { status: "processed" },
        });

        nextItem.state = "processed";
      } catch (error) {
        console.error(`Error processing region with ID ${nextItem.id}:`, error);

        // Update the region status to "error" in the database
        await prisma.mcRegion.update({
          where: { id: nextItem.id },
          data: { status: "error" },
        });

        // Mark the item as errored in the queue
        nextItem.state = "processed";
      }
    }
  }
  processing = false;
}

const executeScript = async (id: number) => {
  const pythonScript = "src/python-scripts/detector.py"; // Adjust the path as necessary
  const mcRegionToProcess = await prisma.mcRegion.findUnique({
    where: { id },
  });
  const { name } = mcRegionToProcess || {};
  if (!name) return {};
  const arg1 = name.split(".")[1];
  const arg2 = name.split(".")[2];
  return new Promise((resolve, reject) => {
    execFile("python3", [pythonScript, arg1, arg2], (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      try {
        const parsedOutput = JSON.parse(stdout);
        resolve(parsedOutput);
      } catch (parseError) {
        console.error(`Error parsing script output: ${parseError}`);
        console.error(`Raw output: ${stdout}`);
        reject(parseError);
      }
    });
  });
};
