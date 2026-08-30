import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/middleware";

const permissionSchema = z.enum([
  "verify_users",
  "edit_names",
  "manage_promos",
  "view_device_data",
  "block_features",
  "manage_admins",
]);

const featureSchema = z.enum([
  "handle_change",
  "name_change",
  "avatar_change",
  "links_edit",
  "payments",
]);

/** Permissions of the signed-in user (full admins hold everything). */
export const myAdminPermissions = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { myAdminAccess } = await import("./admin-access.server");
    return myAdminAccess(context.userId);
  });

export const listAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { assertAdminPermission, listAdminGrants } = await import("./admin-access.server");
    await assertAdminPermission(context.userId, "manage_admins");
    return listAdminGrants();
  });

export const grantAdminPermission = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        permission: permissionSchema,
        granted: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdminPermission, setAdminPermission } = await import("./admin-access.server");
    await assertAdminPermission(context.userId, "manage_admins");
    return setAdminPermission({ adminId: context.userId, ...data });
  });

export const setLegalName = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        firstName: z.string().trim().min(1).max(80),
        lastName: z.string().trim().min(1).max(80),
        applyHandle: z.string().trim().max(60).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdminPermission, setUserLegalName } = await import("./admin-access.server");
    await assertAdminPermission(context.userId, "edit_names");
    return setUserLegalName({ adminId: context.userId, ...data });
  });

export const getUserInsightForAdmin = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdminPermission, getUserInsight } = await import("./admin-access.server");
    await assertAdminPermission(context.userId, "view_device_data");
    return getUserInsight(data.userId);
  });

export const blockUserFeature = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        feature: featureSchema,
        blocked: z.boolean(),
        reason: z.string().trim().max(300).optional(),
        until: z.string().trim().max(40).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdminPermission, setFeatureBlock } = await import("./admin-access.server");
    await assertAdminPermission(context.userId, "block_features");
    return setFeatureBlock({ adminId: context.userId, ...data });
  });

/** Blauw vinkje toekennen of intrekken (permissie: verify_users). */
export const setUserVerifiedStatus = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        verified: z.boolean(),
        firstName: z.string().trim().max(80).optional(),
        lastName: z.string().trim().max(80).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdminPermission, setUserVerified } = await import("./admin-access.server");
    await assertAdminPermission(context.userId, "verify_users");
    return setUserVerified({ adminId: context.userId, ...data });
  });
