-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "authorId" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PROPOSAL';

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
