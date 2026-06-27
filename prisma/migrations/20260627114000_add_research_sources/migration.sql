CREATE TABLE "ResearchSource" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kitId" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResearchSource_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ResearchSource_kitId_createdAt_idx" ON "ResearchSource"("kitId", "createdAt");
