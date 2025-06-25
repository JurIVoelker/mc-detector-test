-- CreateTable
CREATE TABLE "McRegion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unprocessed'
);

-- CreateIndex
CREATE UNIQUE INDEX "McRegion_name_key" ON "McRegion"("name");
