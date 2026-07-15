import { useEffect, useRef, useState } from "preact/hooks";
import { SAMPLE_MODES, applySampleMode } from "../lib/sampleModes.js";

const STORAGE_KEY = "sample_mode_id";

export default function SampleModeSwitcher({ dispatch }) {
  const [modeId, setModeId] = useState(
    () => localStorage.getItem(STORAGE_KEY) || SAMPLE_MODES[0].id,
  );
  const isFirstRun = useRef(true);

  useEffect(() => {
    // 기본 모드는 App.jsx 초기 렌더에서 이미 로드돼 있으므로, 새로고침 직후
    // 첫 마운트에서까지 다시 적용해 선택 상태를 초기화(RESET)할 필요는 없다.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (modeId === SAMPLE_MODES[0].id) return;
    }
    const mode = SAMPLE_MODES.find((m) => m.id === modeId) ?? SAMPLE_MODES[0];
    applySampleMode(mode, dispatch);
  }, [modeId]);

  function handleChange(e) {
    const id = e.target.value;
    localStorage.setItem(STORAGE_KEY, id);
    setModeId(id);
  }

  return (
    <select
      class="app-action-btn sample-mode-switcher"
      value={modeId}
      onChange={handleChange}
      aria-label="샘플 데이터 모드 선택"
      title="샘플 데이터 모드 선택"
    >
      {SAMPLE_MODES.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
