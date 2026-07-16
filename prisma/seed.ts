import { main as seedUser } from "./seeds/usersSeed";
import { main as seedRoles } from "./seeds/rolesSeed";

async function main() {
  await seedUser();
  await seedRoles();
}

main()
  .catch(console.error)
  .finally(() => process.exit(1));
