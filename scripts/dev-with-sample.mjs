// `npm run dev:sample` 전용 스크립트.
// 실데이터 파일은 절대 건드리지 않는다 — 샘플 데이터로의 전환은 vite.config.js의
// sampleDataResolver 플러그인이 DEV_SAMPLE=1일 때 import 경로를 .sample 파일로
// 빌드 타임에 리졸브해서 처리한다(디스크 복사/치환 없음).
import { spawn } from "node:child_process";

console.log(
  "[dev:sample] 샘플(가짜) 데이터로 전환합니다. 실데이터 파일은 전혀 건드리지 않습니다.",
);

const child = spawn("npx", ["vite"], {
  stdio: "inherit",
  env: { ...process.env, DEV_SAMPLE: "1" },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => child.kill(sig));
}
