import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, email, role = "member" } = await request.json();

    if (!orgId || !email) {
      return NextResponse.json({ error: "Organization ID and email required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify current user is an admin of this org
    const { data: currentMember, error: memberError } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .single();

    if (memberError || !currentMember || currentMember.role !== "admin") {
      return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
    }

    // Get org info for the response
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();

    // Try to find the user by email using our RPC function
    const { data: authUser } = await supabase.rpc('get_user_id_by_email', {
      user_email: email.toLowerCase()
    }).single();

    if (authUser?.id) {
      // User exists - add them directly
      const targetUserId = authUser.id;

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("org_members")
        .select("id")
        .eq("org_id", orgId)
        .eq("user_id", targetUserId)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: "User is already a member of this organization" }, { status: 400 });
      }

      // Add the member
      const { error: insertError } = await supabase
        .from("org_members")
        .insert({
          org_id: orgId,
          user_id: targetUserId,
          role: role,
          invited_by: user.id,
        });

      if (insertError) {
        console.error("Error adding member:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        type: "added",
        message: `${email} has been added to ${org?.name || "the organization"}`
      });
    }

    // User doesn't exist - create a pending invite
    // First check if there's already a pending invite
    const { data: existingInvite } = await supabase
      .from("pending_invites")
      .select("id, token")
      .eq("org_id", orgId)
      .eq("email", email.toLowerCase())
      .is("accepted_at", null)
      .single();

    let inviteToken: string;

    if (existingInvite) {
      // Use existing invite token
      inviteToken = existingInvite.token;
    } else {
      // Create new pending invite
      inviteToken = generateToken();
      
      const { error: inviteError } = await supabase
        .from("pending_invites")
        .insert({
          org_id: orgId,
          email: email.toLowerCase(),
          role: role,
          token: inviteToken,
          invited_by: user.id,
        });

      if (inviteError) {
        console.error("Error creating invite:", inviteError);
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
      }
    }

    // Generate the invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "";
    const inviteUrl = `${baseUrl}/signup?invite=${inviteToken}`;

    return NextResponse.json({ 
      success: true, 
      type: "invited",
      message: `Invitation created for ${email}`,
      inviteUrl,
      orgName: org?.name,
    });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
