import type { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../prismaClient";

export const authenticateUserOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ detail: "Not authenticated" });
  }
  try {
    // Get user's organizations
    const mmOrganizationUser =
      await PrismaClient.mm_users_organizations.findMany({
        where: { user_id: userId },
        select: {
          organization_id: true,
        },
      });

    req.userOrganizations = mmOrganizationUser.map(
      (item) => item.organization_id,
    );

    // If an organizationId is provided, check if the user is part of that organization
    if (req.params?.organizationId || req.body?.organization_id) {
      const organizationId =
        req.params.organizationId || req.body.organization_id;
      if (!req.userOrganizations.includes(organizationId)) {
        return res.status(403).json({ detail: "Forbidden" });
      }
    }

    // Othwerwise we should only base on user's organizations
    // console.log(
    //   "GET -",
    //   req.originalUrl,
    //   "organizationId",
    //   req.params?.organizationId || req.body?.organization_id,
    //   !(req.params?.organizationId || req.body?.organization_id)
    //     ? `using ${req.userOrganizations.length} user's organizations`
    //     : "using passed organizationId",
    // );
    return next();
  } catch {
    return res.status(401).json({ detail: "Not authenticated" });
  }
};

export const authenticateUserOrganizationsEdit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ detail: "Not authenticated" });
  }
  try {
    // Get user's organizations
    const mmOrganizationUser =
      await PrismaClient.mm_users_organizations.findMany({
        where: { user_id: userId },
        select: {
          organization_id: true,
        },
      });

    req.userOrganizations = mmOrganizationUser.map(
      (item) => item.organization_id,
    );

    // If an organizationId is not provided, we should reject the request as we won't know which organization to check for
    const organizationId =
      req.params.organizationId || req.body.organization_id;
    if (!organizationId) {
      return res.status(403).json({ detail: "Forbidden - NO" });
    }

    // Check if the user is part of that organization
    // if (req.params?.organizationId || req.body?.organization_id) {
    if (!req.userOrganizations.includes(organizationId)) {
      return res.status(403).json({ detail: "Forbidden - O" });
    }
    // }

    // If the user is part of the organization, check if they have the right role for edit and creation (owner or editor)
    const userOrganizationRoles =
      await PrismaClient.mm_organizations_users_roles.findMany({
        where: {
          user_id: userId,
          organization_id:
            req.params.organizationId || req.body.organization_id,
        },
        select: {
          organization_id: true,
          role: true,
        },
      });

    const selectedOrganizationUserRole = userOrganizationRoles.find(
      (item) =>
        item.organization_id ===
        (req.params.organizationId || req.body.organization_id),
    );

    // If no role found or the role is not owner or editor, reject the request
    if (
      !selectedOrganizationUserRole ||
      !["owner", "editor"].includes(selectedOrganizationUserRole.role.name)
    ) {
      return res.status(403).json({ detail: "Forbidden - R" });
    }
    // console.log(
    //   "EDIT -",
    //   req.originalUrl,
    //   "organizationId",
    //   req.params?.organizationId || req.body?.organization_id,
    //   !(req.params?.organizationId || req.body?.organization_id) ? "- FIX ME" : "",
    // );
    return next();
  } catch {
    return res.status(401).json({ detail: "Not authenticated" });
  }
};
