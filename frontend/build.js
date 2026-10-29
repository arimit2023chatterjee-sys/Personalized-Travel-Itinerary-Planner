import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");

console.log("==> [Frontend Build] Building Vite bundle...");
execSync("npx vite build", { stdio: "inherit", cwd: __dirname });

if (fs.existsSync(path.join(distDir, "index.html"))) {
  fs.copyFileSync(path.join(distDir, "index.html"), path.join(distDir, "404.html"));
  console.log("==> [Frontend Build] Created 404.html SPA fallback in dist/");
}

// Also mirror to other common locations in case Render runs inside frontend/
const mirrorDirs = [
  path.join(__dirname, "..", "dist"),
  path.join(__dirname, "..", "public"),
  path.join(__dirname, "..", "build"),
  path.join(__dirname, "build"),
  path.join(__dirname, "frontend", "dist")
];

for (const dir of mirrorDirs) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.cpSync(distDir, dir, { recursive: true, force: true });
    fs.copyFileSync(path.join(dir, "index.html"), path.join(dir, "404.html"));
  } catch (err) {
    // Ignore permissions or path edge cases
  }
}

console.log("==> [Frontend Build] Frontend build complete!");
