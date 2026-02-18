import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  await p.user.delete({ where: { email: "test-raceplan@test.com" } });
  console.log("Cleaned up orphaned test user");
} catch {
  console.log("No cleanup needed");
}
await p.$disconnect();
