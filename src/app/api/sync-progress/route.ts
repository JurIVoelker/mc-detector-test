import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isLooping = true;
      let prevString = "";
      try {
        while (isLooping) {
          const queuedMcRegions = await prisma.mcRegion.findMany({
            where: {
              status: {
                in: ["queued", "processing"],
              },
            },
            select: {
              id: true,
              status: true,
            },
          });

          const stringifiedRegions = JSON.stringify(queuedMcRegions);
          if (prevString !== stringifiedRegions) {
            console.log({ stringifiedRegions });
            controller.enqueue(
              encoder.encode(`data: ${stringifiedRegions}\n\n`)
            );
          }
          prevString = stringifiedRegions;
          await sleep(2000);

          if (
            queuedMcRegions.every((region) => region.status === "processed")
          ) {
            await sleep(8000);
          }
        }

        const cancel = () => {
          isLooping = false;
          controller.close();
        };

        request.signal.addEventListener("abort", cancel);
      } catch (error) {
        isLooping = false;
        // @ts-expect-error error may not have a code property
        if (error?.code === "ERR_INVALID_STATE") {
          return;
        }
        console.error("Error in SSE stream:", error);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
