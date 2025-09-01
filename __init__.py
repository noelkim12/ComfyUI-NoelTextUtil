from .noel_unified_prefix import NoelUnifiedPrefix
from .lora_trigger_injector import NoelLoRATriggerInjector

"""Top-level package for ComfyUI-NoelTextUtil."""
__author__ = """Noel Kim"""
__email__ = "noel_kim12@naver.com"
__version__ = "0.0.1"


WEB_DIRECTORY = "./web"

NODE_CLASS_MAPPINGS = {
    "NoelUnifiedPrefix": NoelUnifiedPrefix,
    "NoelLoRATriggerInjector": NoelLoRATriggerInjector,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "NoelUnifiedPrefix": "Unified Prefix",
    "NoelLoRATriggerInjector": "LoRA Trigger Injector",
}

__all__ = [
    "NODE_CLASS_MAPPINGS",
    "NODE_DISPLAY_NAME_MAPPINGS",
    "WEB_DIRECTORY",
]
