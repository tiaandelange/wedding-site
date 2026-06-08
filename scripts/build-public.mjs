import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "public");

const files = [
  "index.html",
  "main.js",
  "styles.css",
  "rsvp.html",
  "rsvp.js",
  "rsvp.css",
];

const dirs = ["images", "Fonts", "PDFs"];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const file of files) {
  cpSync(join(root, file), join(out, file));
}

for (const dir of dirs) {
  cpSync(join(root, dir), join(out, dir), { recursive: true });
}

console.log("Static site copied to public/");
