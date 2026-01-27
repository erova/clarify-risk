import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Organization, OrgMember, UserOrgContext } from "@/types";

const CURRENT_ORG_COOKIE = "vibesharing_current_org";

/**
 * Get the current organization context for the logged-in user.
 * Returns null values if user has no orgs or org tables don't exist yet.
 */
export async function getOrgContext(): Promise<UserOrgContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { currentOrg: null, orgs: [], membership: null };
  }

  try {
    // Get all orgs the user is a member of
    const { data: memberships, error: memberError } = await supabase
      .from("org_members")
      .select(`
        *,
        organizations (*)
      `)
      .eq("user_id", user.id);

    if (memberError) {
      // Tables might not exist yet
      console.error("Error fetching org memberships:", memberError);
      return { currentOrg: null, orgs: [], membership: null };
    }

    if (!memberships || memberships.length === 0) {
      return { currentOrg: null, orgs: [], membership: null };
    }

    // Extract organizations from memberships
    const orgs = memberships
      .map((m) => m.organizations as Organization)
      .filter(Boolean);

    // Get current org from cookie, or default to first org
    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value;
    
    let currentOrg = orgs.find((o) => o.id === currentOrgId) || orgs[0];
    let membership = memberships.find((m) => m.org_id === currentOrg?.id) as OrgMember | undefined;

    return {
      currentOrg: currentOrg || null,
      orgs,
      membership: membership || null,
    };
  } catch (error) {
    console.error("Error in getOrgContext:", error);
    return { currentOrg: null, orgs: [], membership: null };
  }
}

/**
 * Set the current organization (called from client-side API route)
 */
export async function setCurrentOrg(orgId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_ORG_COOKIE, orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Create a new organization and add the current user as admin
 */
export async function createOrganization(name: string, slug: string): Promise<Organization | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Must be logged in to create an organization");
  }

  // Create the organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, slug })
    .select()
    .single();

  if (orgError) {
    console.error("Error creating organization:", orgError);
    throw new Error(orgError.message);
  }

  // Add user as admin
  const { error: memberError } = await supabase
    .from("org_members")
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: "admin",
      invited_by: user.id,
    });

  if (memberError) {
    console.error("Error adding user as admin:", memberError);
    // Try to clean up the org
    await supabase.from("organizations").delete().eq("id", org.id);
    throw new Error(memberError.message);
  }

  // Set as current org
  await setCurrentOrg(org.id);

  return org as Organization;
}
