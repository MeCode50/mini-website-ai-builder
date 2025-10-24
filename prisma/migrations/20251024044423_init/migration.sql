-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "websites" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "cssContent" TEXT,
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_logs" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "error" TEXT,
    "duration" INTEGER,
    "tokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_logs_pkey" PRIMARY KEY ("id")
);
