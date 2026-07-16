import { PrismaClient, type role_name } from "@prisma/client";

const prisma = new PrismaClient();

const roles = ["owner", "editor", "viewer"];

// Creates roles if they don't already exist
export async function main() {
  const existingRoles = await prisma.roles.findMany();

  for (const roleName of roles) {
    const exists = existingRoles.some((r) => r.name === roleName);
    if (exists) {
      console.log(`Role ${roleName} already exists`);
      continue;
    }

    await prisma.roles.create({
      data: {
        name: roleName as role_name,
      },
    });
    console.log(`Role ${roleName} created`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
