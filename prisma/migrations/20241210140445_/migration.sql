-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('START', 'EMAIL', 'WAIT', 'CONDITION', 'WEBHOOK', 'ADD_TO_LIST', 'REMOVE_FROM_LIST', 'UPDATE_SUBSCRIBER', 'CHECK_ENGAGEMENT', 'SEGMENT', 'TAG', 'UNSUBSCRIBE', 'CUSTOM_CODE', 'EXIT');

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationNode" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationNodeEdge" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "animated" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AutomationNodeEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Automation_teamId_idx" ON "Automation"("teamId");

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationNode" ADD CONSTRAINT "AutomationNode_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationNodeEdge" ADD CONSTRAINT "AutomationNodeEdge_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationNodeEdge" ADD CONSTRAINT "AutomationNodeEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AutomationNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationNodeEdge" ADD CONSTRAINT "AutomationNodeEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "AutomationNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
