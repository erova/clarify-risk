import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Get the origin from the request
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(new URL("/", origin));
}
