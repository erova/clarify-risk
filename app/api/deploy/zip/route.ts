import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";

interface VercelFile {
  file: string;
  data: string;
}

// Deploy files to Vercel
async function deployToVercel(
  projectName: string,
  files: VercelFile[],
  vercelToken: string
): Promise<{ url: string; id: string }> {
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

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    return NextResponse.json(
      { error: "Vercel token not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const prototypeId = formData.get("prototypeId") as string;
    const projectName = formData.get("projectName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read and extract ZIP
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const files: VercelFile[] = [];

    // Skip patterns
    const skipDirs = new Set([
      "node_modules",
      ".git",
      ".next",
      ".vercel",
      "__MACOSX",
    ]);
    const skipFiles = new Set([
      ".DS_Store",
      "Thumbs.db",
      ".env",
      ".env.local",
    ]);

    // Process all files in the ZIP
    const zipFiles = Object.keys(zip.files);
    
    // Check if all files are in a single root folder (common when zipping a folder)
    let rootFolder = "";
    const firstFile = zipFiles.find(f => !zip.files[f].dir);
    if (firstFile && firstFile.includes("/")) {
      const potentialRoot = firstFile.split("/")[0];
      const allInRoot = zipFiles.every(
        f => f.startsWith(potentialRoot + "/") || f === potentialRoot + "/"
      );
      if (allInRoot) {
        rootFolder = potentialRoot + "/";
      }
    }

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      // Skip directories
      if (zipEntry.dir) continue;

      // Get the relative path (strip root folder if present)
      let relativePath = path;
      if (rootFolder && path.startsWith(rootFolder)) {
        relativePath = path.substring(rootFolder.length);
      }

      // Skip if empty path
      if (!relativePath) continue;

      // Check if any parent directory should be skipped
      const pathParts = relativePath.split("/");
      const shouldSkip = pathParts.some((part) => skipDirs.has(part));
      if (shouldSkip) continue;

      // Check if file should be skipped
      const fileName = pathParts[pathParts.length - 1];
      if (skipFiles.has(fileName)) continue;

      // Read file content
      const content = await zipEntry.async("nodebuffer");

      // Skip files larger than 1MB
      if (content.length > 1024 * 1024) {
        console.log(`Skipping large file: ${relativePath}`);
        continue;
      }

      files.push({
        file: relativePath,
        data: content.toString("base64"),
      });
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No valid files found in ZIP" },
        { status: 400 }
      );
    }

    // Check total size
    const totalSize = files.reduce((sum, f) => sum + f.data.length, 0);
    if (totalSize > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ZIP contents too large. Max ~8MB after excluding node_modules." },
        { status: 400 }
      );
    }

    // Generate unique project name
    const projectSlug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
    const uniqueName = `proto-${projectSlug}-${Date.now().toString(36)}`;

    console.log(`Deploying ${files.length} files to Vercel as ${uniqueName}...`);

    // Deploy to Vercel
    const deployment = await deployToVercel(uniqueName, files, vercelToken);

    // Update the prototype with the deployed URL
    if (prototypeId) {
      const { error: updateError } = await supabase
        .from("projects")
        .update({ external_url: deployment.url })
        .eq("id", prototypeId);

      if (updateError) {
        console.error("Failed to update prototype URL:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      deployedUrl: deployment.url,
      projectName: uniqueName,
      fileCount: files.length,
    });
  } catch (error) {
    console.error("ZIP deploy error:", error);
    const message = error instanceof Error ? error.message : "Deployment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
