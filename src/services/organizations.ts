import { PrismaClient } from "../prismaClient";
import { Prisma } from "@prisma/client";

export const getAllOrganizations = async () =>
  PrismaClient.organizations.findMany();
export const getAllOrganizationsByIds = async (ids: string[]) =>
  PrismaClient.organizations.findMany({ where: { id: { in: ids } } });
export const getOrganizationById = async (id: string) =>
  PrismaClient.organizations.findUnique({ where: { id } });
export const createOrganization = async (
  data: Prisma.organizationsCreateInput,
  ownerUserId: string,
) => {
  const ownerRole = await PrismaClient.roles.findUnique({
    where: { name: "owner" },
  });

  if (!ownerRole) {
    throw new Error("Owner role not found");
  }

  return PrismaClient.$transaction(async (tx) => {
    // Create the organization
    const organization = await tx.organizations.create({ data });

    // Add the owner user to the organization and assign them the owner role
    await tx.mm_users_organizations.create({
      data: {
        user_id: ownerUserId,
        organization_id: organization.id,
      },
    });

    // Add the owner role to the user for this organization
    await tx.mm_organizations_users_roles.create({
      data: {
        user_id: ownerUserId,
        organization_id: organization.id,
        role_id: ownerRole.id,
      },
    });

    // Expand your needs when you need to add more related data to the organization creation process.

    return organization;
  });
};
export const updateOrganization = async (
  id: string,
  data: Prisma.organizationsUpdateInput,
) => PrismaClient.organizations.update({ where: { id }, data });
export const deleteOrganization = async (id: string) =>
  PrismaClient.organizations.delete({ where: { id } });
