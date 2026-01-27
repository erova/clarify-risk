import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
  sha: string;
}

interface VercelFile {
  file: string;
  data: string; // base64 encoded
}

// Recursively fetch all files from a GitHub repo
async function fetchRepoFiles(
  owner: string,
  repo: string,
  path: string = ""
): Promise<VercelFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Proto-Hub",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const items: GitHubFile[] = await res.json();
  const files: VercelFile[] = [];

  for (const item of items) {
    // Skip common non-essential files/folders
    if (
      item.name === ".git" ||
      item.name === "node_modules" ||
      item.name === ".env" ||
      item.name === ".env.local"
    ) {
      continue;
    }

    if (item.type === "dir") {
      // Recursively get files from subdirectory
      const subFiles = await fetchRepoFiles(owner, repo, item.path);
      files.push(...subFiles);
    } else if (item.type === "file" && item.download_url) {
      // Fetch file content
      const fileRes = await fetch(item.download_url);
      if (fileRes.ok) {
        const content = await fileRes.arrayBuffer();
        const base64 = Buffer.from(content).toString("base64");
        files.push({
          file: item.path,
          data: base64,
        });
      }
    }
  }

  return files;
}

// Deploy files to Vercel
async function deployToVercel(
  projectName: string,
  files: VercelFile[],
  vercelToken: string
): Promise<{ url: string; id: string }> {
  // Create deployment
  const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      files: files.map((f) => ({
        file: f.file,
        data: f.data,
        encoding: "base64",
      })),
      projectSettings: {
        framework: null, // Auto-detect
      },
    }),
  });

  const deployData = await deployRes.json();

  if (!deployRes.ok) {
    console.error("Vercel deployment error:", deployData);
    throw new Error(deployData.error?.message || "Deployment failed");
  }

  return {
    url: `https://${deployData.url}`,
    id: deployData.id,
  };
}

// Deploy a GitHub repo to Vercel
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) {
    return NextResponse.json(
      { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
      { status: 400 }
    );
  }

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, "");

  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    return NextResponse.json(
      { error: "Vercel token not configured" },
      { status: 500 }
    );
  }

  try {
    // Generate a unique project name
    const projectSlug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    const uniqueName = `proto-${projectSlug}-${Date.now().toString(36)}`;

    // Fetch all files from the GitHub repo
    console.log(`Fetching files from ${owner}/${cleanRepo}...`);
    const files = await fetchRepoFiles(owner, cleanRepo);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files found in repository. Make sure it's a public repo." },
        { status: 400 }
      );
    }

    console.log(`Found ${files.length} files, deploying to Vercel...`);

    // Deploy to Vercel
    const deployment = await deployToVercel(uniqueName, files, vercelToken);

    // The production URL will be the project name
    const deployedUrl = deployment.url;

    // Update the prototype with the deployed URL
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
      projectName: uniqueName,
      fileCount: files.length,
      message: "Deployment successful!",
    });
  } catch (error) {
    console.error("Deployment error:", error);
    const message = error instanceof Error ? error.message : "Deployment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
