import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const standaloneNextDir = path.join(standaloneDir, ".next");
const staticSource = path.join(root, ".next", "static");
const staticTarget = path.join(standaloneNextDir, "static");
const publicSource = path.join(root, "public");
const publicTarget = path.join(standaloneDir, "public");

if (!existsSync(standaloneDir)) {
  process.exit(0);
}

mkdirSync(standaloneNextDir, { recursive: true });

if (existsSync(staticSource)) {
  rmSync(staticTarget, { recursive: true, force: true });
  cpSync(staticSource, staticTarget, { recursive: true });
}

if (existsSync(publicSource)) {
  rmSync(publicTarget, { recursive: true, force: true });
  cpSync(publicSource, publicTarget, { recursive: true });
}
