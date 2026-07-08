import { Router, type Request } from "express";
import {
  createMmUsersOrganization,
  deleteMmUsersOrganization,
  getAllMmUsersOrganizations,
  getAllMmUsersOrganizationsByOrganizationIds,
  getMmUsersOrganizationByOrganizationId,
  getMmUsersOrganizationById,
  updateMmUsersOrganization,
} from "../services/mmUsersOrganizations";
import {
  authenticateUser,
  authenticateUserAdmin,
} from "../utils/authMiddleware";
import {
  authenticateUserOrganizations,
  authenticateUserOrganizationsEdit,
} from "../utils/organizationAuthMiddleware";

const mmUsersOrganizationsRouter = Router();
mmUsersOrganizationsRouter.use(authenticateUser);

mmUsersOrganizationsRouter.get(
  "/",
  authenticateUserOrganizations,
  async (req, res) => {
    try {
      const items = await getAllMmUsersOrganizationsByOrganizationIds(
        req.userOrganizations || [],
      );
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch mm_users_organizations" });
    }
  },
);

mmUsersOrganizationsRouter.get(
  "/:id/organization/:organizationId",
  authenticateUserOrganizations,
  async (req: Request<{ id: string; organizationId: string }>, res) => {
    try {
      const item = await getMmUsersOrganizationById(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch record" });
    }
  },
);

mmUsersOrganizationsRouter.get(
  "/organization/:organizationId",
  authenticateUserOrganizations,
  async (req: Request<{ organizationId: string }>, res) => {
    try {
      const item = await getMmUsersOrganizationByOrganizationId(
        req.params.organizationId,
      );
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch record" });
    }
  },
);

mmUsersOrganizationsRouter.post(
  "/",
  authenticateUserOrganizationsEdit,
  async (req, res) => {
    try {
      const created = await createMmUsersOrganization(req.body);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: "Failed to create record" });
    }
  },
);

mmUsersOrganizationsRouter.put(
  "/:id",
  authenticateUserOrganizationsEdit,
  async (req: Request<{ id: string }>, res) => {
    try {
      const updated = await updateMmUsersOrganization(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Failed to update record" });
    }
  },
);

mmUsersOrganizationsRouter.delete(
  "/:id",
  authenticateUserOrganizationsEdit,
  async (req: Request<{ id: string }>, res) => {
    try {
      await deleteMmUsersOrganization(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete record" });
    }
  },
);

mmUsersOrganizationsRouter.get(
  "/admin",
  authenticateUserAdmin,
  async (req, res) => {
    try {
      const items = await getAllMmUsersOrganizations();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch mm_users_organizations" });
    }
  },
);

export default mmUsersOrganizationsRouter;
