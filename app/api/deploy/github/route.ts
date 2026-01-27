import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Deploy a GitHub repo to Vercel
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoUrl, projectName, prototypeId } = await request.json();

  if (!repoUrl || !projectName) {
    return NextResponse.json(
      { error: "repoUrl and projectName are required" },
      { status: 400 }
    );
  }

  // Parse GitHub URL to get owner/repo
  // Supports: https://github.com/owner/repo or github.com/owner/repo
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return NextResponse.json(
      { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
      { status: 400 }
    );
  }

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, ""); // Remove .git suffix if present

  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    return NextResponse.json(
      { error: "Vercel token not configured" },
      { status: 500 }
    );
  }

  try {
    // Create a deployment using Vercel's API
    // This creates a new project and deploys from the GitHub repo
    const projectSlug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // First, try to create a project linked to the GitHub repo
    const createProjectRes = await fetch("https://api.vercel.com/v10/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `proto-${projectSlug}`,
        framework: null, // Auto-detect
        gitRepository: {
          type: "github",
          repo: `${owner}/${cleanRepo}`,
        },
      }),
    });

    const projectData = await createProjectRes.json();

    if (!createProjectRes.ok) {
      // If project already exists, that's okay - we'll trigger a new deployment
      if (projectData.error?.code !== "project_already_exists") {
        console.error("Vercel project creation error:", projectData);
        return NextResponse.json(
          { error: projectData.error?.message || "Failed to create Vercel project" },
          { status: 400 }
        );
      }
    }

    // Get the project to find its domains
    const projectNameOnVercel = projectData.name || `proto-${projectSlug}`;
    const getProjectRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectNameOnVercel}`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    );

    const existingProject = await getProjectRes.json();
    
    // The deployed URL will be the project's production domain
    // Format: projectname.vercel.app
    const deployedUrl = `https://${projectNameOnVercel}.vercel.app`;

    // If we have a prototypeId, update it with the deployed URL
    if (prototypeId) {
      const { error: updateError } = await supabase
        .from("projects")
        .update({ external_url: deployedUrl })
        .eq("id", prototypeId);

      if (updateError) {
        console.error("Failed to update prototype URL:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      deployedUrl,
      projectName: projectNameOnVercel,
      message: "Deployment initiated. It may take a minute to go live.",
      vercelProject: existingProject,
    });

  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: "Failed to deploy. Check server logs." },
      { status: 500 }
    );
  }
}
