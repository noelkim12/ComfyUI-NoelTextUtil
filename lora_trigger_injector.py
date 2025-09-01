# lora_trigger_injector.py
import json, os
from pathlib import Path
from typing import Dict, List, Any, Tuple
import folder_paths

# ----- LoRA 스캔 -----
def _scan_lora_names() -> List[str]:
    """
    ComfyUI의 folder_paths를 사용하여 LoRA 파일 목록을 가져옵니다.
    드롭다운이 텍스트로 강등되지 않도록 항상 빈 항목 "" 포함.
    """
    try:
        # folder_paths를 사용하여 loras 폴더의 파일 목록 가져오기
        lora_names = folder_paths.get_filename_list("loras")
        # 빈 항목을 첫 번째에 추가
        return [""] + lora_names if lora_names else [""]
    except Exception as e:
        print(f"LoRA 스캔 중 오류 발생: {e}")
        return [""]

# ----- 유틸 -----
def _flatten_triggers(val: Any) -> List[str]:
    if val is None:
        return []
    raw = val if isinstance(val, list) else [str(val)]
    out: List[str] = []
    for item in raw:
        # 콤마 우선 분리, 없으면 공백 분리
        for token in str(item).replace("\n", " ").split(","):
            token = token.strip()
            if not token:
                continue
            if " " in token and "," not in token:
                out += [t for t in token.split() if t]
            else:
                out.append(token)
    # 순서 유지 + 대소문자 무시 중복 제거
    seen = set(); uniq = []
    for t in out:
        tl = t.lower()
        if tl not in seen:
            seen.add(tl); uniq.append(t)
    return uniq

def _inject_triggers(base_prompt: str, active_triggers: List[str],
                     dedupe: bool, mode: str) -> Tuple[str, List[str]]:
    """
    활성 트리거를 base_prompt에 주입합니다.
    """
    base = base_prompt or ""
    base_lc = base.lower()
    
    # 중복 제거
    if dedupe:
        active_triggers = [t for t in active_triggers if t.lower() not in base_lc]
    
    if not active_triggers:
        return base, []
    
    # 트리거를 구분자 없이 통째로 주입
    inject_str = ", ".join(active_triggers)
    
    if base.strip():
        final = inject_str + " " + base if mode == "prepend" else base + " " + inject_str
    else:
        final = inject_str
    
    return final, active_triggers

# ----- 본 노드 -----
class NoelLoRATriggerInjector:
    """
    LoRA 트리거 자동 주입 노드
    
    기능:
    - LORA_STACK과 positive_prompt를 입력받아 트리거를 자동 주입
    - lora_count에 따라 동적으로 LoRA 슬롯 표시/숨김
    - 설정된 LoRA의 트리거를 positive prompt에 prepend/append
    - LORA_STACK과 가공된 positive prompt를 다음 노드로 전달
    
    입력:
    - lora_stack: LoRA_Stacker_ED로부터 받은 LORA_STACK (optional)
    - positive_prompt: 이전 노드로부터 받은 positive prompt (optional)
    - lora_count: 사용할 LoRA 슬롯 수 (1-50)
    - dedupe: 중복 트리거 제거 여부
    - mode: 트리거 삽입 위치
    """
    CATEGORY = "Noel/LoRA"
    FUNCTION = "run"
    _MAX = 50  # 최대 페어 수

    @classmethod
    def INPUT_TYPES(cls):
        required = {
            "lora_count": ("INT", {"default": 5, "min": 1, "max": cls._MAX, "tooltip": "사용할 LoRA 슬롯 수"}),
            "dedupe": ("BOOLEAN", {"default": True, "tooltip": "중복 트리거 제거 (프롬프트에 이미 있는 트리거는 추가하지 않음)"}),
            "mode": (["append", "prepend"], {"default": "append", "tooltip": "트리거 삽입 위치"}),
        }
        
        optional = {
            "lora_stack": ("LORA_STACK", {"tooltip": "LoRA_Stacker_ED로부터 받은 LORA_STACK"}),
            "positive_prompt": ("STRING", {"forceInput": True, "tooltip": "트리거를 주입할 positive prompt"}),
        }
        
        # 최대 50개까지 LoRA 슬롯 정의 (초기에는 5개만 표시, JS에서 동적 숨김/보임 처리)
        lora_names = ["None", ""] + folder_paths.get_filename_list("loras")
        for i in range(1, cls._MAX + 1):
            optional[f"lora_{i}_name"] = (lora_names,)
            optional[f"lora_{i}_triggers"] = ("STRING", {"multiline": True, "default": "", "tooltip": f"LoRA {i} 트리거 (콤마나 공백으로 구분)"})
        return {"required": required, "optional": optional}

    RETURN_TYPES = ("LORA_STACK", "STRING", "STRING")
    RETURN_NAMES = ("lora_stack", "positive_prompt", "injected_triggers")

    def run(self,
            lora_count: int,
            dedupe: bool = True,
            mode: str = "append",
            lora_stack=None,
            positive_prompt: str = "",
            **kwargs):
        # 1) 입력받은 lora_stack을 그대로 유지 (수정하지 않음)
        final_lora_stack = lora_stack if lora_stack is not None else []
        
        # 2) 노드의 LoRA 슬롯에서 트리거 매핑 생성 (lora_count 이내)
        n = max(1, min(int(lora_count), self._MAX))
        lora_name_to_triggers = {}  # LoRA 이름과 트리거 매핑
        
        for i in range(1, n + 1):
            name = (kwargs.get(f"lora_{i}_name", "") or "").strip()
            trig = kwargs.get(f"lora_{i}_triggers", "") or ""
            
            # LoRA 이름이 설정되어 있고 트리거가 있는 경우 매핑에 저장
            if name and name != "None" and trig:
                lora_name_to_triggers[name] = _flatten_triggers(trig)
        
        # 3) lora_stack의 LoRA와 노드 설정을 매칭하여 활성 트리거 수집
        active_triggers: List[str] = []
        for lora_name, model_str, clip_str in final_lora_stack:
            if lora_name in lora_name_to_triggers:
                active_triggers.extend(lora_name_to_triggers[lora_name])
        
        # 5) 트리거 주입
        new_prompt, added = _inject_triggers(
            base_prompt=positive_prompt,
            active_triggers=active_triggers,
            dedupe=dedupe,
            mode=mode
        )
        
        # 디버그 로그
        print(f"\n=== NoelLoRATriggerInjector Debug ===")
        print(f"Input LORA_STACK: {lora_stack}")
        print(f"Node LoRA mappings: {lora_name_to_triggers}")
        print(f"Matched triggers: {active_triggers}")
        print(f"Original prompt: '{positive_prompt}'")
        print(f"Dedupe: {dedupe}, Mode: {mode}")
        print(f"Final prompt: '{new_prompt}'")
        print(f"Injected triggers: '{' '.join(added) if added else ''}'")
        print(f"Output LORA_STACK: {final_lora_stack}")
        print(f"=====================================\n")
        
        # 6) LORA_STACK과 가공된 positive prompt, 주입된 트리거 목록 반환
        return (final_lora_stack, new_prompt+",", " ".join(added) if added else ""+",")

    @classmethod
    def VALIDATE_INPUTS(cls, **kwargs):
        """lora_count에 따라 동적으로 유효성 검사"""
        lora_count = kwargs.get('lora_count', 5)
        lora_names = ["None", ""] + folder_paths.get_filename_list("loras")
        
        # lora_count 이내의 슬롯만 검증
        for i in range(1, min(lora_count + 1, cls._MAX + 1)):
            lora_name = kwargs.get(f"lora_{i}_name", "")
            if lora_name and lora_name not in lora_names:
                return f"LoRA not found: {lora_name}"
        
        return True