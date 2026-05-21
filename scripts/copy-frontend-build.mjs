import fs from "fs";
import path from "path";

const root = process.cwd();
const buildFrontendDir = path.join(root, ".build", "frontend", "frontend");
const frontendDir = path.join(root, "frontend");

for (const file of ["app.js", "apiClient.js"]) {
  const from = path.join(buildFrontendDir, file);
  const to = path.join(frontendDir, file);

  if (!fs.existsSync(from)) {
    throw new Error(`Build file not found: ${from}`);
  }

  let content = fs.readFileSync(from, "utf-8");
  content = content.replaceAll('from "./apiClient";', 'from "./apiClient.js";');
  fs.writeFileSync(to, content, "utf-8");
}

console.log("Frontend build copied to frontend/*.js");
