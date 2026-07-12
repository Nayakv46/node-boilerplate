import { Router } from "express";
import organizationsRouter from "./organizations";
import mmUsersOrganizationsRouter from "./mmUsersOrganizations";
import authRouter from "./auth";

const router = Router();

router.use("/auth", authRouter);
router.use("/organizations", organizationsRouter);
router.use("/mm_users_organizations", mmUsersOrganizationsRouter);

export default router;
