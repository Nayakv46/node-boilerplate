import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../src/utils/passwordHashing";

const prisma = new PrismaClient();

// Creates an admin user if it doesn't already exist
async function main() {
  const email = "admin@example.com";

  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("User already exists");
    return;
  }

  const passwordHash = await hashPassword("admin123");

  await prisma.users.create({
    data: {
      email,
      password_hash: passwordHash,
      is_admin: true,
      first_name: "Admin",
      last_name: "User",
    },
  });

  console.log("Admin user created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
