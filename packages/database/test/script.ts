/// Run this script using `pnpm tsx test/script.ts` from `packages/database` dir
import { prisma } from "../lib/prisma"

async function main() {
  // Create five new users
  const usersData = [
    { username: "alice", password: "hashedpassword1" },
    { username: "bob", password: "hashedpassword2" },
    { username: "charlie", password: "hashedpassword3" },
    { username: "diana", password: "hashedpassword4" },
    { username: "eve", password: "hashedpassword5" },
  ]

  for (const data of usersData) {
    const user = await prisma.user.create({
      data,
    })
    console.log("Created user:", user)
  }

  // Fetch all users
  const allUsers = await prisma.user.findMany()
  console.log("All users:", JSON.stringify(allUsers, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
