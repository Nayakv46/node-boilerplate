import { main as seedUser } from "./usersSeed";
import { main as seedRoles } from "./rolesSeed";

async function main() {
  await seedUser();
  await seedRoles();
}

main()
  .catch(console.error)
  .finally(() => process.exit(1));
