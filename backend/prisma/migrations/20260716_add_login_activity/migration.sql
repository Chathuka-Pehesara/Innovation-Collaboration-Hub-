-- CreateTable
CREATE TABLE IF NOT EXISTS "LoginActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL DEFAULT 'none',
    "ip" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoginActivity_userId_idx" ON "LoginActivity"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoginActivity_fingerprint_idx" ON "LoginActivity"("fingerprint");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LoginActivity_ip_idx" ON "LoginActivity"("ip");

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
