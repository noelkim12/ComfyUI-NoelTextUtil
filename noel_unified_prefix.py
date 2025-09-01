# noel_unified_prefix.py
import json, threading, time
from pathlib import Path
from typing import Any, Dict, Optional

_STATE_DIR = Path(__file__).parent / "_state"
_STATE_FILE = _STATE_DIR / "character_counters.json"
_LOCK = threading.Lock()

def _load_state() -> Dict[str, Any]:
    try:
        if _STATE_FILE.exists():
            return json.loads(_STATE_FILE.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {}

def _save_state(data: Dict[str, Any]) -> None:
    _STATE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = _STATE_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(_STATE_FILE)

def _ensure(st: Dict[str, Any], ch: str) -> None:
    if ch not in st:
        st[ch] = {
            "portrait": 1,
            "run": 0,
            "frame": 1,
            "last_video_ts": 0.0,
        }

def _z(n: int, w: int) -> str:
    return str(max(1, int(n))).zfill(max(1, int(w)))

class NoelUnifiedPrefix:
    """
    경로 포함 prefix를 생성하는 단일 노드.
      - portrait_image 입력 시: '{character}/portrait_{###}'
      - video_image 입력 시: gap 기반으로 새 run 감지 후
          video_prefix: '{character}/animation_{###}'
          frame_prefix: '{character}/animation_{###}/{#####}'
    Save Image의 subfolder는 비워두고 filename_prefix만 연결하면 저장됨.
    """
    CATEGORY = "Noel/Prefixes"
    FUNCTION = "run"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "character_name": ("STRING", {"default": "test"}),
                "pad_portrait": ("INT", {"default": 3, "min": 1, "max": 10}),
                "pad_run": ("INT", {"default": 3, "min": 1, "max": 10}),
                "pad_frame": ("INT", {"default": 5, "min": 1, "max": 10}),
                "gap_timeout_sec": ("FLOAT", {"default": 1.5, "min": 0.0, "max": 60.0, "step": 0.1}),
            },
            "optional": {
                "portrait_image": ("IMAGE",),
                "video_image": ("IMAGE",),
            }
        }

    RETURN_TYPES = ("STRING","IMAGE","STRING","IMAGE","STRING","IMAGE")
    RETURN_NAMES  = (
        "portrait_fullprefix","portrait_image",
        "video_fullprefix","video_image",
        "frame_fullprefix","frame_image",
    )

    def run(
        self,
        character_name: str,
        pad_portrait: int,
        pad_run: int,
        pad_frame: int,
        gap_timeout_sec: float,
        portrait_image: Optional[Any] = None,
        video_image: Optional[Any] = None,
    ):
        ch = (character_name or "").strip() or "Unknown"
        out_portrait_prefix = ""
        out_video_prefix = ""
        out_frame_prefix = ""

        now = time.time()

        with _LOCK:
            st = _load_state()
            _ensure(st, ch)

            portrait = int(st[ch]["portrait"])
            run = int(st[ch]["run"])
            frame = int(st[ch]["frame"])
            last_ts = float(st[ch].get("last_video_ts", 0.0))

            # Portrait
            if portrait_image is not None:
                out_portrait_prefix = f"{ch}/portrait_{_z(portrait, pad_portrait)}"
                portrait += 1
                st[ch]["portrait"] = portrait

            # Video / Frame
            if video_image is not None:
                if last_ts == 0.0 or (now - last_ts) > float(gap_timeout_sec):
                    run += 1
                    frame = 1
                run_str = _z(run, pad_run)
                out_video_prefix = f"{ch}/animation_{run_str}"
                out_frame_prefix = f"{ch}/animation_{run_str}/{_z(frame, pad_frame)}"
                frame += 1
                st[ch]["run"] = run
                st[ch]["frame"] = frame
                st[ch]["last_video_ts"] = now

            _save_state(st)

        # passthrough
        return (
            out_portrait_prefix, portrait_image,
            out_video_prefix,    video_image,
            out_frame_prefix,    video_image,
        )


