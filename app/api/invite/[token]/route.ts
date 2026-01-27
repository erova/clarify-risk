import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Check invite and get org info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  // Get the invite
  const { data: invite, error } = await supabase
    .from("pending_invites")
    .select("id, email, role, org_id, expires_at, accepted_at")
    .eq("token", token)
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 400 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
  }

  // Get the organization separately
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("id", invite.org_id)
    .single();

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    organization: org || { id: invite.org_id, name: "Organization", slug: "" },
  });
}

// POST - Accept invite (called after signup)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Must be logged in to accept invite" }, { status: 401 });
  }

  // Get the invite
  const { data: invite, error: inviteError } = await supabase
    .from("pending_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: "This invite has already been used" }, { status: 400 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite has expired" }, { status: 400 });
  }

  // Check if user email matches invite email
  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json({ 
      error: `This invite is for ${invite.email}. Please sign up with that email address.` 
    }, { status: 400 });
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from("org_members")
    .select("id")
    .eq("org_id", invite.org_id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    // Mark invite as accepted anyway
    await supabase
      .from("pending_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    return NextResponse.json({ 
      success: true, 
      message: "You're already a member of this organization" 
    });
  }

  // Add user to org
  const { error: memberError } = await supabase
    .from("org_members")
    .insert({
      org_id: invite.org_id,
      user_id: user.id,
      role: invite.role,
      invited_by: invite.invited_by,
    });

  if (memberError) {
    console.error("Error adding member:", memberError);
    return NextResponse.json({ error: "Failed to join organization" }, { status: 500 });
  }

  // Mark invite as accepted
  await supabase
    .from("pending_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ success: true, orgId: invite.org_id });
}
