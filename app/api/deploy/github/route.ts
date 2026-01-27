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

// Recursively fetch all files from a GitHub repo (or subdirectory)
async function fetchRepoFiles(
  owner: string,
  repo: string,
  path: string = "",
  basePath: string = "" // The root path to strip from file paths
): Promise<VercelFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Proto-Hub",
  };
  
  // Use GitHub token if available (increases rate limit from 60 to 5000/hr)
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }
  
  const res = await fetch(url, { headers });

  if (!res.ok) {
    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        throw new Error("GitHub API rate limit exceeded. Please add a GITHUB_TOKEN environment variable.");
      }
    }
    if (res.status === 404) {
      throw new Error("Repository not found. Make sure it's a public repo and the URL is correct.");
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const items: GitHubFile[] = await res.json();
  const files: VercelFile[] = [];

  // Directories to skip
  const skipDirs = new Set([
    ".git",
    "node_modules",
    ".next",
    ".vercel",
    "dist",
    "build",
    ".cache",
    "coverage",
    ".turbo",
  ]);

  // Files to skip
  const skipFiles = new Set([
    ".env",
    ".env.local",
    ".env.production",
    ".DS_Store",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ]);

  // File extensions to skip (binary/large files)
  const skipExtensions = new Set([
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".mp3",
    ".wav",
    ".psd",
    ".ai",
    ".sketch",
    ".fig",
  ]);

  for (const item of items) {
    // Skip directories we don't need
    if (item.type === "dir" && skipDirs.has(item.name)) {
      continue;
    }

    // Skip files we don't need
    if (item.type === "file" && skipFiles.has(item.name)) {
      continue;
    }

    // Skip large binary file types
    const ext = item.name.includes(".") 
      ? "." + item.name.split(".").pop()?.toLowerCase() 
      : "";
    if (skipExtensions.has(ext)) {
      continue;
    }

    if (item.type === "dir") {
      // Recursively get files from subdirectory
      const subFiles = await fetchRepoFiles(owner, repo, item.path, basePath);
      files.push(...subFiles);
    } else if (item.type === "file" && item.download_url) {
      // Fetch file content
      const fileHeaders: Record<string, string> = { "User-Agent": "Proto-Hub" };
      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken) {
        fileHeaders.Authorization = `Bearer ${githubToken}`;
      }
      
      const fileRes = await fetch(item.download_url, { headers: fileHeaders });
      if (fileRes.ok) {
        const content = await fileRes.arrayBuffer();
        
        // Skip files larger than 1MB
        if (content.byteLength > 1024 * 1024) {
          console.log(`Skipping large file: ${item.path} (${content.byteLength} bytes)`);
          continue;
        }
        
        const base64 = Buffer.from(content).toString("base64");
        
        // Strip the base path from the file path so it's relative to the subdirectory
        let filePath = item.path;
        if (basePath && filePath.startsWith(basePath)) {
          filePath = filePath.substring(basePath.length);
          if (filePath.startsWith("/")) {
            filePath = filePath.substring(1);
          }
        }
        
        files.push({
          file: filePath,
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

  // Parse GitHub URL to get owner/repo and optional subdirectory path
  // Supports:
  //   https://github.com/owner/repo
  //   https://github.com/owner/repo/tree/branch/path/to/folder
  const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!repoMatch) {
    return NextResponse.json(
      { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
      { status: 400 }
    );
  }

  const [, owner, repoRaw] = repoMatch;
  const cleanRepo = repoRaw.replace(/\.git$/, "");

  // Check for subdirectory path (format: /tree/branch/path/to/folder)
  let subPath = "";
  const pathMatch = repoUrl.match(/\/tree\/[^\/]+\/(.+)$/);
  if (pathMatch) {
    subPath = pathMatch[1];
    // Remove trailing slash if present
    if (subPath.endsWith("/")) {
      subPath = subPath.slice(0, -1);
    }
  }

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

    // Fetch all files from the GitHub repo (or subdirectory)
    const pathDesc = subPath ? `${owner}/${cleanRepo}/${subPath}` : `${owner}/${cleanRepo}`;
    console.log(`Fetching files from ${pathDesc}...`);
    const files = await fetchRepoFiles(owner, cleanRepo, subPath, subPath);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files found in repository. Make sure it's a public repo." },
        { status: 400 }
      );
    }

    // Check total size (Vercel limit is ~10MB for the request body)
    const totalSize = files.reduce((sum, f) => sum + f.data.length, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`Found ${files.length} files, total size: ${totalSizeMB}MB`);

    if (totalSize > 8 * 1024 * 1024) { // 8MB to leave room for JSON overhead
      return NextResponse.json(
        { error: `Repository is too large (${totalSizeMB}MB). Max is ~8MB. Try a smaller repo or one without large assets.` },
        { status: 400 }
      );
    }

    console.log(`Deploying to Vercel...`);

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
