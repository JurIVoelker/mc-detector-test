-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoundEntities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "data3d" TEXT,
    "regionId" INTEGER NOT NULL,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FoundEntities_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "McRegion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FoundEntities" ("createdAt", "data", "data3d", "id", "regionId", "type", "updatedAt") SELECT "createdAt", "data", "data3d", "id", "regionId", "type", "updatedAt" FROM "FoundEntities";
DROP TABLE "FoundEntities";
ALTER TABLE "new_FoundEntities" RENAME TO "FoundEntities";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
