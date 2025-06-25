import { addToExecutionQueue, queuedMcRegions } from "@/lib/executionQueue";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const regionId = searchParams.get("regionId");

  if (!regionId) {
    return new Response("Region ID is required", { status: 400 });
  }

  addToExecutionQueue(parseInt(regionId));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      try {
        controller.enqueue(encoder.encode(`data: queued\n\n`));
        const interval = setInterval(() => {
          const currentRegionState = queuedMcRegions.find(
            (region) => region.id === parseInt(regionId)
          );

          if (currentRegionState && currentRegionState.state === "processed") {
            // Wenn der Prozess abgeschlossen ist, senden wir eine Abschlussnachricht
            queuedMcRegions.splice(
              queuedMcRegions.findIndex(
                (region) => region.id === parseInt(regionId)
              ),
              1
            );
            controller.enqueue(encoder.encode(`data: processed\n\n`));
            clearInterval(interval);
            controller.close();
            return;
          } else if (
            currentRegionState &&
            currentRegionState.state === "processing"
          ) {
            // Wenn der Prozess noch läuft, senden wir den aktuellen Status
            controller.enqueue(encoder.encode(`data: processing\n\n`));
            return;
          }
        }, 2000);

        // Verbindung schließen, wenn der Client sie schließt
        const cancel = () => {
          // clearInterval(interval);
          controller.close();
        };

        request.signal.addEventListener("abort", cancel);
      } catch (error) {
        console.error("Error in SSE stream:", error);
        controller.error(error);
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

// export async function POST(request: NextRequest) {
//   const { searchParams } = request.nextUrl;
//   const regionId = searchParams.get("regionId");

//   if (!regionId) {
//     return new Response("Region ID is required", { status: 400 });
//   }

//   const currentRegionState = queuedMcRegions.find(
//     (region) => region.id === parseInt(regionId)
//   );

//   if (!currentRegionState) {
//     return new Response("Region not found", { status: 404 });
//   }

//   // Simulate processing
//   currentRegionState.state = "processing";

//   // Simulate processing completion after a delay
//   setTimeout(() => {
//     currentRegionState.state = "processed";
//   }, 5000);

//   return new Response("Processing started", { status: 200 });
// }
