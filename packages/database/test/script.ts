/// Run this script using `pnpm tsx test/script.ts` from `packages/database` dir
import { prisma } from "../lib/prisma";

async function main() {
  // Create a test user matching the Better Auth user model
  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: "Alice",
      email: "alice@example.com",
      emailVerified: true,
    },
  });
  console.log("Created user:", user);

  // Create an account with email/password provider for the user
  const account = await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: "hashed_placeholder", // In real usage, Better Auth handles hashing
    },
  });
  console.log("Created account:", account);

  // Fetch all users with their accounts
  const allUsers = await prisma.user.findMany({
    include: {
      accounts: true,
      sessions: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
