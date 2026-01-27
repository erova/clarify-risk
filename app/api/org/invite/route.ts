import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { orgId, email } = await request.json();

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

    // Find the user by email using Supabase admin API
    // Note: This requires the user to already have an account
    // In a production app, you might want to send email invitations instead
    const { data: users, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", email);

    // Try alternative approach - use RPC or check if user exists through their profile
    // For now, we'll use a workaround with the auth.users view if available
    // or fall back to checking the org_members table for the email

    // Since we can't directly query auth.users from the client, 
    // we'll need to use a different approach. Let's try to look up the user
    // by checking existing org_members across all orgs (if they exist anywhere)
    
    // Alternative: Accept the user ID directly or use Supabase Auth Admin API
    // For this implementation, we'll check if the email matches any existing user
    // by attempting to add them and catching the foreign key error

    // First, let's try to find if this user already exists in any org
    const { data: existingMembership } = await supabase
      .from("org_members")
      .select("user_id")
      .limit(1);

    // We need to use a service role or admin API to look up users by email
    // For now, let's assume the user provides a valid user_id
    // or we use a database function

    // Workaround: Use the RPC function if available, or just try to insert
    // and let the foreign key constraint tell us if the user doesn't exist

    // For this MVP, we'll use a simpler approach:
    // 1. Admin enters an email
    // 2. We try to find the user via a join or RPC
    // 3. If not found, return an error

    // Since we can't easily query auth.users, let's create a workaround
    // by having users "claim" their invitation when they log in

    // SIMPLE APPROACH: Use Supabase's auth.users() if we have service role
    // For now, we'll return an error asking for the user ID instead
    
    // Actually, let's use a more practical approach:
    // Query the auth schema if accessible (might need service role)
    
    const { data: authUser, error: authError } = await supabase.rpc('get_user_id_by_email', {
      user_email: email
    }).single();

    let targetUserId: string;

    if (authError || !authUser) {
      // RPC doesn't exist or user not found
      // For now, return a helpful error
      return NextResponse.json({ 
        error: "User not found. They must create an account first, then you can invite them." 
      }, { status: 404 });
    }

    targetUserId = authUser.id;

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
        role: "member",
        invited_by: user.id,
      });

    if (insertError) {
      console.error("Error adding member:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
