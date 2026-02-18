import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

// Load DATABASE_URL from .env.local
const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#][^=]*)="(.*)"$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/\\n/g, "");
}

const prisma = new PrismaClient();

const EMAIL = "stuartbladon@icloud.com";

async function main() {
  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email: EMAIL } });

  if (!user) {
    console.log(`User ${EMAIL} not found yet. They need to complete the quiz and sign up first.`);
    console.log("Re-run this script after they've signed up.");
    return;
  }

  // Grant free access — set a far-future expiration (10 years)
  const farFuture = new Date();
  farFuture.setFullYear(farFuture.getFullYear() + 10);

  await prisma.user.update({
    where: { email: EMAIL },
    data: {
      stripeSubscriptionId: "free_access_granted",
      stripeCurrentPeriodEnd: farFuture,
    },
  });

  console.log(`Granted free access to ${EMAIL}`);
  console.log(`Subscription ID: free_access_granted`);
  console.log(`Access expires: ${farFuture.toISOString()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
