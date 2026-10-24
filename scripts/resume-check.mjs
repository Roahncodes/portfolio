// `npm run resume`
//
// The break-glass command after running out of tokens: typechecks the project,
// then reports the first incomplete step in PROGRESS.md so work can continue
// exactly where it stopped. Exit code is 0 only when the typecheck passes.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const progressPath = path.join(root, "PROGRESS.md");

console.log("\n╭─ resume check ───────────────────────────────────────────────╮");
console.log("│ typechecking…                                                 │");
console.log("╰──────────────────────────────────────────────────────────────╯\n");

const tsc = spawnSync("npx", ["tsc", "--noEmit"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

const typecheckOk = tsc.status === 0;
console.log(typecheckOk ? "\n✅  typecheck passed\n" : "\n❌  typecheck failed — fix this first\n");

if (!fs.existsSync(progressPath)) {
  console.error("PROGRESS.md is missing — it holds the step list.");
  process.exit(1);
}

const rows = fs
  .readFileSync(progressPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.match(/^\|\s*(\d{2})\s*\|\s*(.+?)\s*\|\s*(⬜|🔄|✅|⚠️)\s*\|$/))
  .filter(Boolean)
  .map((match) => ({ id: match[1], title: match[2], status: match[3] }));

if (rows.length === 0) {
  console.log("No step table found in PROGRESS.md.");
  process.exit(typecheckOk ? 0 : 1);
}

const done = rows.filter((row) => row.status === "✅").length;
const next = rows.find((row) => row.status !== "✅");

console.log(`Progress: ${done}/${rows.length} steps complete\n`);
for (const row of rows) {
  console.log(`  ${row.status} ${row.id}  ${row.title}`);
}

if (next) {
  console.log(`\n▶︎ NEXT STEP → ${next.id}: ${next.title}`);
  console.log("  Read PROGRESS.md §4 and the matching entry in MEMORY/step-log.md,");
  console.log("  then continue from there.\n");
} else {
  console.log("\n🎉 Every step is complete. Nothing left to resume.\n");
}

process.exit(typecheckOk ? 0 : 1);
