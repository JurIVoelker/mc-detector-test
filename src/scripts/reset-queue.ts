import { prisma } from "@/lib/prisma";

(async () => {
  await prisma.mcRegion.updateMany({
    where: {
      status: {
        in: ["queued", "processing"],
      },
    },
    data: {
      status: "unprocessed",
    },
  });
})();
