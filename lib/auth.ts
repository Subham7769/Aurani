import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type UserRole = "ADMIN" | "RESELLER" | "CUSTOMER";

export async function getRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth();
  if (!sessionClaims) return null;
  const meta = sessionClaims.publicMetadata as { role?: UserRole } | undefined;
  return meta?.role ?? null;
}

export async function requireRole(role: UserRole): Promise<void> {
  const actual = await getRole();
  if (actual !== role) {
    redirect("/");
  }
}

export async function getAuthUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/**
 * Ensures a User + Reseller row exist in DB for the current Clerk user.
 * Called on dashboard load so webhooks aren't needed in local dev.
 */
export async function ensureResellerInDb(): Promise<string> {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const role =
    ((clerkUser.publicMetadata as { role?: UserRole })?.role) ?? "CUSTOMER";

  if (role !== "RESELLER") redirect("/");

  const { db } = await import("@/lib/db");

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUser.id}@unknown.com`;

  // Upsert the User row
  const user = await db.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { email, role: "RESELLER" },
    create: { clerkId: clerkUser.id, email, role: "RESELLER" },
    select: { id: true, reseller: { select: { id: true, isActive: true } } },
  });

  // Create or activate Reseller row
  if (!user.reseller) {
    const reseller = await db.reseller.create({
      data: { userId: user.id, isActive: true },
      select: { id: true },
    });
    return reseller.id;
  }

  if (!user.reseller.isActive) {
    await db.reseller.update({
      where: { userId: user.id },
      data: { isActive: true },
    });
  }

  return user.reseller.id;
}

export async function getResellerId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const { db } = await import("@/lib/db");
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { reseller: { select: { id: true } } },
  });
  return user?.reseller?.id ?? null;
}

export async function requireResellerId(): Promise<string> {
  const id = await getResellerId();
  if (!id) redirect("/sign-in");
  return id;
}
