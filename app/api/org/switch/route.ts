import { NextRequest, NextResponse } from "next/server";
import { setCurrentOrg } from "@/lib/org-context";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json();

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a member of this org
    const { data: membership, error } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (error || !membership) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
    }

    // Set the current org cookie
    await setCurrentOrg(orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error switching org:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
