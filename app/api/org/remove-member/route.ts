import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the member record to find the org_id
    const { data: memberToRemove, error: memberError } = await supabase
      .from("org_members")
      .select("org_id, user_id")
      .eq("id", memberId)
      .single();

    if (memberError || !memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Verify current user is an admin of this org
    const { data: currentMember, error: adminError } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", memberToRemove.org_id)
      .eq("user_id", user.id)
      .single();

    if (adminError || !currentMember || currentMember.role !== "admin") {
      return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
    }

    // Can't remove yourself
    if (memberToRemove.user_id === user.id) {
      return NextResponse.json({ error: "You cannot remove yourself from the organization" }, { status: 400 });
    }

    // Remove the member
    const { error: deleteError } = await supabase
      .from("org_members")
      .delete()
      .eq("id", memberId);

    if (deleteError) {
      console.error("Error removing member:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
