import { Router } from "express";
import organizationsRouter from "./organizations";
import mmUsersOrganizationsRouter from "./mmUsersOrganizations";

const router = Router();

router.use("/organizations", organizationsRouter);
router.use("/mm_users_organizations", mmUsersOrganizationsRouter);

export default router;
