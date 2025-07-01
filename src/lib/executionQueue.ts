import { execFile } from "child_process";
import { prisma } from "./prisma";

type Vec3 = [number, number, number];
export type FoundBlockSphere = { local: Vec3; world: Vec3; item_id: number };

export async function addToExecutionQueue(id: number) {
  await prisma.mcRegion.update({
    where: { id },
    data: { status: "queued" },
  });
  processQueue();
}

export async function addAllToExecutionQueue() {
  await prisma.mcRegion.updateMany({
    where: { status: { in: ["error", "unprocessed"] } },
    data: { status: "queued" },
  });
  processQueue();
}

async function processQueue() {
  const processingRegions = await prisma.mcRegion.findMany({
    where: {
      status: "processing",
    },
  });

  if (processingRegions.length > 0) {
    console.log(
      "Processing is already in progress, skipping new queue processing."
    );
    return;
  }

  let queuedRegions = await prisma.mcRegion.findMany({
    where: {
      status: "queued",
    },
  });

  if (queuedRegions.length === 0) {
    return;
  }

  while (queuedRegions.some((item) => item.status === "queued")) {
    const nextItem = queuedRegions.find((item) => item.status === "queued");
    if (nextItem) {
      try {
        await prisma.mcRegion.update({
          where: { id: nextItem.id },
          data: { status: "processing" },
        });

        console.log(`Processing region with ID ${nextItem.id}`);
        const timeBefore = Date.now();
        await executeScript(nextItem.id);
        const timeAfter = Date.now();
        console.log(
          `Processing region with ID ${nextItem.id} took ${
            (timeAfter - timeBefore) / 1000
          } seconds`
        );

        await prisma.mcRegion.update({
          where: { id: nextItem.id },
          data: { status: "processed" },
        });
      } catch (error) {
        console.error(`Error processing region with ID ${nextItem.id}:`, error);

        // Update the region status to "error" in the database
        await prisma.mcRegion.update({
          where: { id: nextItem.id },
          data: { status: "error" },
        });
      }
    }
    queuedRegions = await prisma.mcRegion.findMany({
      where: {
        status: "queued",
      },
    });
  }
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
        resolve(stdout);
      } catch (parseError) {
        console.error(`Error parsing script output: ${parseError}`);
        console.error(`Raw output: ${stdout}`);
        reject(parseError);
      }
    });
  });
};
