import { Router, type Request } from "express";
import {
  createOrganization,
  deleteOrganization,
  getAllOrganizations,
  getAllOrganizationsByIds,
  getOrganizationById,
  updateOrganization,
} from "../services/organizations";
import {
  authenticateUser,
  authenticateUserAdmin,
} from "../utils/authMiddleware";
import {
  authenticateUserOrganizations,
  authenticateUserOrganizationsEdit,
} from "../utils/organizationAuthMiddleware";

const organizationsRouter = Router();
organizationsRouter.use(authenticateUser);

organizationsRouter.get(
  "/",
  authenticateUserOrganizations,
  async (req, res) => {
    try {
      const items = await getAllOrganizationsByIds(req.userOrganizations || []);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  },
);

organizationsRouter.get(
  "/:organizationId",
  authenticateUserOrganizations,
  async (req: Request<{ organizationId: string }>, res) => {
    try {
      const item = await getOrganizationById(req.params.organizationId);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  },
);

// No auth middleware here beacuse we need to create the organization first before we can check if the user has access to it
organizationsRouter.post("/", async (req, res) => {
  try {
    const created = await createOrganization(req.body, req.userId as string);
    res.status(201).json(created);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: "Failed to create organization" });
  }
});

organizationsRouter.put(
  "/:organizationId",
  authenticateUserOrganizationsEdit,
  async (req: Request<{ organizationId: string }>, res) => {
    try {
      const updated = await updateOrganization(
        req.params.organizationId,
        req.body,
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update organization" });
    }
  },
);

organizationsRouter.delete(
  "/:organizationId",
  authenticateUserOrganizationsEdit,
  async (req: Request<{ organizationId: string }>, res) => {
    try {
      await deleteOrganization(req.params.organizationId);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete organization" });
    }
  },
);

// Admin endpoint to get all organizations regardless of user access
organizationsRouter.get("/admin", authenticateUserAdmin, async (req, res) => {
  try {
    const items = await getAllOrganizations();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

export default organizationsRouter;
