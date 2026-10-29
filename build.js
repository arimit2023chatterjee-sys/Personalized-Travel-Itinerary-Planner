import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;
const frontendDir = path.join(rootDir, "frontend");
const frontendDist = path.join(frontendDir, "dist");

console.log("==> [Root Build] Starting production build...");

// 1. Install frontend dependencies
console.log("==> [Root Build] Ensuring frontend dependencies are installed...");
try {
  execSync("npm install --prefix frontend --include=dev", { stdio: "inherit", cwd: rootDir });
} catch (err) {
  console.warn("==> Warning during frontend install, proceeding with build:", err.message);
}

// 2. Build frontend using Vite
console.log("==> [Root Build] Building frontend with Vite...");
execSync("npm run build --prefix frontend", { stdio: "inherit", cwd: rootDir });

if (!fs.existsSync(frontendDist) || !fs.existsSync(path.join(frontendDist, "index.html"))) {
  console.error("==> Error: frontend/dist/index.html was not generated!");
  process.exit(1);
}

// 3. Create 404.html in frontendDist for SPA routing fallback
fs.copyFileSync(path.join(frontendDist, "index.html"), path.join(frontendDist, "404.html"));

// 4. Mirror files across all common publish directories to ensure Render finds it
const targetDirs = [
  path.join(rootDir, "dist"),
  path.join(rootDir, "build"),
  path.join(rootDir, "public"),
  path.join(frontendDir, "build"),
  path.join(frontendDir, "frontend", "dist")
];

for (const dir of targetDirs) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.cpSync(frontendDist, dir, { recursive: true, force: true });
    fs.copyFileSync(path.join(dir, "index.html"), path.join(dir, "404.html"));
    console.log(`==> [Root Build] Mirrored assets to: ${path.relative(rootDir, dir)}/`);
  } catch (err) {
    console.warn(`==> Warning mirroring to ${dir}:`, err.message);
  }
}

console.log("==> [Root Build] Build successfully completed!");
