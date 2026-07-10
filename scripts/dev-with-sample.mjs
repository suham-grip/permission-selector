// `npm run dev:sample` 전용 스크립트.
// 로컬 실데이터(gitignore 대상)를 잠시 백업해두고 .sample 데이터로 바꿔서 dev 서버를 띄운 뒤,
// 서버가 종료되면(정상 종료/Ctrl+C 모두) 실데이터를 원래대로 복원한다.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PAIRS = [
  ["src/data/menus.json", "src/data/menus.sample.json"],
  ["src/data/shortcuts.js", "src/data/shortcuts.sample.js"],
  ["src/data/glossary.js", "src/data/glossary.sample.js"],
  ["src/data/helpTexts.js", "src/data/helpTexts.sample.js"],
  ["src/data/contact.js", "src/data/contact.sample.js"],
];

const backups = [];

function swapToSample() {
  for (const [real, sample] of PAIRS) {
    const realPath = path.resolve(real);
    const samplePath = path.resolve(sample);
    if (fs.existsSync(realPath)) {
      const backupPath = `${realPath}.local-backup`;
      fs.renameSync(realPath, backupPath);
      backups.push([realPath, backupPath]);
    }
    fs.copyFileSync(samplePath, realPath);
  }
}

let restored = false;
function restoreReal() {
  if (restored) return;
  restored = true;
  for (const [real, sample] of PAIRS) {
    const realPath = path.resolve(real);
    const backupPath = `${realPath}.local-backup`;
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, realPath);
    } else {
      // 원래 실데이터가 없던 경우 — 이번에 생성한 샘플 복사본만 제거
      fs.rmSync(realPath, { force: true });
    }
  }
  console.log("[dev:sample] 원래 데이터로 복원했습니다.");
}

swapToSample();
console.log("[dev:sample] 샘플(가짜) 데이터로 전환했습니다. 종료 시 자동으로 원래 데이터로 복원됩니다.");

const child = spawn("npx", ["vite"], { stdio: "inherit" });

child.on("exit", (code) => {
  restoreReal();
  process.exit(code ?? 0);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => child.kill(sig));
}
