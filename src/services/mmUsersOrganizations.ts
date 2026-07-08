import { PrismaClient } from "../prismaClient";
import type { Prisma, role_name } from "@prisma/client";

const mmUsersOrganizationsInclude = {
  user: {
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      is_admin: true,
      created_at: true,
      updated_at: true,
      roles: {
        select: {
          id: true,
          engagement_id: true,
          role_id: true,
          assigned_at: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
};

export const getAllMmUsersOrganizations = async () =>
  PrismaClient.mm_users_organizations.findMany({
    include: mmUsersOrganizationsInclude,
  });
export const getAllMmUsersOrganizationsByOrganizationIds = async (
  organizationIds: string[],
) =>
  PrismaClient.mm_users_organizations.findMany({
    where: {
      organization_id: {
        in: organizationIds,
      },
    },
    include: mmUsersOrganizationsInclude,
  });
export const getMmUsersOrganizationById = async (id: string) =>
  PrismaClient.mm_users_organizations.findUnique({
    where: { id },
    include: mmUsersOrganizationsInclude,
  });

export const getMmUsersOrganizationByOrganizationId = async (id: string) =>
  PrismaClient.mm_users_organizations.findMany({
    where: { organization_id: id },
    include: mmUsersOrganizationsInclude,
  });
export const createMmUsersOrganization = async (
  data: Prisma.mm_users_organizationsCreateInput,
) =>
  PrismaClient.mm_users_organizations.create({
    data,
    // include: mmUsersOrganizationsInclude,
  });
export const updateMmUsersOrganization = async (
  mmUsersOrganizationsId: string,
  data: {
    organization_id: string;
    user_id: string;
    role: role_name;
  },
) => {
  try {
    return await PrismaClient.$transaction(async (tx) => {
      // If role is being updated, we need to update the corresponding role in mm_users_organizations_roles
      const role = await tx.roles.findFirst({
        where: {
          name: data.role,
        },
      });

      if (role) {
        const mmOrganizationsUsersRoles =
          await tx.mm_organizations_users_roles.findFirst({
            where: {
              user_id: data.user_id,
              organization_id: data.organization_id,
            },
            select: {
              id: true,
            },
          });
        const updatedUserRole = await tx.mm_organizations_users_roles.update({
          where: {
            id: mmOrganizationsUsersRoles?.id,
          },
          data: {
            role_id: role.id,
          },
        });

        return updatedUserRole;
      }
    });
  } catch (err) {
    console.log("Error updating mm_users_organizations:", err);
    throw err;
  }
};
export const deleteMmUsersOrganization = async (id: string) =>
  PrismaClient.mm_users_organizations.delete({ where: { id } });
