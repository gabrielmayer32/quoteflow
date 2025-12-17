-- AlterTable
ALTER TABLE "businesses"
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_emailVerificationToken_key" ON "businesses"("emailVerificationToken");
