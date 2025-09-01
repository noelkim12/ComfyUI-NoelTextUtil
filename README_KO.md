# ComfyUI-NoelTextUtil

[English](./README.md) | [한국어](./README_KO.md)

LoRA 트리거 주입과 통합 prefix 관리를 위한 ComfyUI 텍스트 유틸리티 노드들입니다.

> [!NOTE]
> 이 프로젝트는 [cookiecutter](https://github.com/Comfy-Org/cookiecutter-comfy-extension) 템플릿을 사용하여 생성되었습니다. Python 설정에 신경 쓰지 않고도 커스텀 노드를 작성할 수 있도록 도와줍니다.

## 🙏 특별한 감사

**NyaamZ** - 이 프로젝트의 동적 UI 기능과 LoRA 통합 기능에 영감과 참조 패턴을 제공한 훌륭한 [Efficiency Nodes 💬ExtendeD](https://github.com/NyaamZ/efficiency-nodes-ED) 프로젝트에 감사드립니다.

## 🚀 빠른 시작

1. [ComfyUI](https://docs.comfy.org/get_started)를 설치하세요.
2. [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager)를 설치하세요.
3. ComfyUI-Manager에서 이 확장을 찾아 설치하세요. 수동으로 설치하려면 `ComfyUI/custom_nodes` 아래에 이 저장소를 클론하세요.
4. ComfyUI를 재시작하세요.

## ✨ 주요 기능

### 🎯 NoelUnifiedPrefix 노드
- **캐릭터 기반 프리픽스 관리**: 캐릭터 초상화와 애니메이션을 위한 체계적인 파일 프리픽스 생성
- **자동 카운터 관리**: 캐릭터별로 초상화, 런, 프레임에 대한 별도 카운터 유지
- **스마트 비디오 감지**: 시간 간격을 기반으로 새로운 애니메이션 런 감지
- **유연한 패딩**: 일관된 파일 명명을 위한 설정 가능한 제로 패딩
- **상태 지속성**: 세션 간 캐릭터 카운터 자동 저장

### 🔥 NoelLoRATriggerInjector 노드
- **LORA_STACK 통합**: 활성 LoRA를 감지하기 위해 LoRA_Stacker_ED와 연동
- **동적 트리거 주입**: 활성 LoRA를 기반으로 positive prompt에 LoRA 트리거 주입
- **유연한 설정**: 
  - 설정 가능한 LoRA 슬롯 (1-50개, 기본값: 5개)
  - 추가/앞에 삽입 주입 모드
  - 중복 제거 지원
  - 실시간 LoRA 슬롯 관리
- **향상된 UI/UX**:
  - 동적 노드 높이 조절
  - 검색 기능이 있는 LoRA 선택
  - 실시간 위젯 가시성 관리

## 🏗️ 아키텍처

### 노드 구조

#### NoelUnifiedPrefix
```
입력:
├── character_name: 프리픽스 생성을 위한 캐릭터 이름
├── pad_portrait: 초상화 카운터용 제로 패딩
├── pad_run: 애니메이션 런 카운터용 제로 패딩
├── pad_frame: 프레임 카운터용 제로 패딩
├── gap_timeout_sec: 새로운 애니메이션 런을 감지하기 위한 시간 간격
├── portrait_image: 선택적 초상화 이미지 입력
└── video_image: 선택적 비디오 프레임 입력

출력:
├── portrait_fullprefix: "{character}/portrait_{###}"
├── portrait_image: 통과 초상화 이미지
├── video_fullprefix: "{character}/animation_{###}"
├── video_image: 통과 비디오 이미지
├── frame_fullprefix: "{character}/animation_{###}/{#####}"
└── frame_image: 통과 비디오 이미지
```

#### NoelLoRATriggerInjector
```
필수 입력:
├── lora_count: 표시할 LoRA 슬롯 수 (1-50)
├── dedupe: 중복 트리거 제거
└── mode: "append" 또는 "prepend" 트리거 주입

선택적 입력:
├── lora_stack: LoRA_Stacker_ED로부터의 LORA_STACK
├── positive_prompt: 트리거 주입을 위한 기본 프롬프트
└── lora_X_name + lora_X_triggers: LoRA 설정 슬롯 (1-50)

출력:
├── lora_stack: 통과 LORA_STACK
├── positive_prompt: 주입된 트리거가 포함된 향상된 프롬프트
└── injected_triggers: 주입된 트리거 문자열 목록
```

### JavaScript 확장 (lti.js)
- **동적 위젯 관리**: `lora_count`에 따라 LoRA 슬롯 표시/숨김
- **스마트 높이 조절**: `node.setSize()`를 사용한 자동 노드 높이 조절
- **실시간 UI 업데이트**: `lora_count` 변경 시 즉시 인터페이스 업데이트

## 🔧 사용 예시

### NoelUnifiedPrefix - 캐릭터 파일 관리
1. **초상화 생성**: 초상화 이미지를 연결하여 `{character}/portrait_{###}` 프리픽스 생성
2. **애니메이션 시퀀스**: 비디오 프레임을 연결하여 `{character}/animation_{###}/{#####}` 프리픽스 생성
3. **자동 런 감지**: `gap_timeout_sec`을 기반으로 새로운 애니메이션 런 감지
4. **상태 지속성**: 캐릭터 카운터가 자동으로 저장되고 복원됨

### NoelLoRATriggerInjector - LoRA 트리거 관리
1. **LORA_STACK 연결**: LoRA_Stacker_ED 노드에서 연결
2. **LoRA 슬롯 설정**: `lora_count`와 LoRA 이름/트리거 쌍 설정
3. **자동 감지**: 노드가 자동으로 LORA_STACK과 설정된 LoRA를 매칭
4. **트리거 주입**: 활성 LoRA를 기반으로 positive_prompt에 트리거 주입
5. **출력**: 향상된 프롬프트와 LORA_STACK을 다음 노드로 전달

### 고급 설정
- **중복 제거**: 최종 프롬프트에서 중복 트리거 방지
- **다중 LoRA**: 복잡한 워크플로우를 위한 최대 50개 LoRA 슬롯 설정
- **동적 조정**: `lora_count`를 실시간으로 변경하여 슬롯 표시/숨김
- **주입 모드**: 추가(끝) 또는 앞에 삽입(시작) 트리거 배치 선택

## 🎨 UI 기능

### 동적 인터페이스
- **반응형 레이아웃**: 표시된 LoRA 슬롯에 따라 노드 높이가 자동 조절
- **스마트 위젯 관리**: `lora_count`로 지정된 수의 LoRA 슬롯만 표시
- **실시간 업데이트**: `lora_count` 변경 시 즉시 인터페이스 업데이트
- **자동 크기 조절**: 안정적인 높이 관리를 위해 ComfyUI의 네이티브 `setSize()` 메서드 사용

### 향상된 LoRA 선택
- **검색 기능**: 실시간 필터링이 있는 빠른 LoRA 이름 검색
- **이미지 미리보기**: ed_betterCombos.js가 있을 때 시각적 LoRA 미리보기
- **드롭다운 인터페이스**: 깔끔하고 직관적인 선택 인터페이스
- **대체 지원**: 외부 확장이 있든 없든 작동
- **폴더 통합**: LoRA 검색을 위해 ComfyUI의 `folder_paths.get_filename_list("loras")` 사용

## 🔌 의존성

### 필수
- ComfyUI (최신 버전 권장)
- Python 3.8+
- `folder_paths` 모듈 (ComfyUI에 내장됨)

### 선택적
- **ed_betterCombos.js**: 이미지 미리보기가 있는 향상된 LoRA 선택 (ComfyUI 설치에 있는 경우)

## 🚧 개발

개발 의존성과 pre-commit을 설치하려면 (ruff 훅이 실행됨):

```bash
cd ComfyUI-NoelTextUtil
pip install -e .[dev]
pre-commit install
```

위의 `-e` 플래그는 "라이브" 설치를 의미하며, 노드 확장에 대한 변경사항이 ComfyUI를 다시 실행할 때마다 자동으로 반영됩니다.

## 🧪 테스트

이 저장소는 `tests/` 디렉토리에 Pytest로 작성된 단위 테스트를 포함합니다. 커스텀 노드에 대한 단위 테스트를 작성하는 것이 권장됩니다.

- [build-pipeline.yml](.github/workflows/build-pipeline.yml)은 모든 열린 PR에서 pytest와 linter를 실행합니다
- [validate.yml](.github/workflows/validate.yml)은 [node-diff](https://github.com/Comfy-Org/node-diff)를 실행하여 호환성 문제를 확인합니다

## 📦 레지스트리에 게시

이 커스텀 노드를 커뮤니티의 다른 사람들과 공유하고 싶다면 레지스트리에 게시할 수 있습니다. `pyproject.toml`의 `tool.comfy` 아래에 일부 필드를 자동으로 채워넣었지만, 올바른지 다시 한 번 확인해 주세요.

https://registry.comfy.org에서 계정을 만들고 API 키 토큰을 생성해야 합니다.

- [ ] [레지스트리](https://registry.comfy.org)로 이동하세요. 로그인하고 게시자 ID를 생성하세요 (레지스트리 프로필의 `@` 기호 뒤에 있는 모든 것).
- [ ] 게시자 ID를 pyproject.toml 파일에 추가하세요.
- [ ] Github에서 게시하기 위한 레지스트리 API 키를 생성하세요. [지침](https://docs.comfy.org/registry/publishing#create-an-api-key-for-publishing).
- [ ] Github 저장소 시크릿에 `REGISTRY_ACCESS_TOKEN`으로 추가하세요.

Github 액션이 모든 git push에서 실행됩니다. Github 액션을 수동으로 실행할 수도 있습니다. 전체 지침은 [여기](https://docs.comfy.org/registry/publishing)에 있습니다. 질문이 있으면 [discord](https://discord.com/invite/comfyorg)에 참여하세요!

## 🤝 기여

기여를 환영합니다! Pull Request를 자유롭게 제출해 주세요. 주요 변경사항의 경우 먼저 이슈를 열어 논의해 주세요.

### 개발 가이드라인
- 기존 코드 스타일과 패턴을 따르세요
- 새로운 기능에 대한 테스트를 추가하세요
- API 변경사항에 대한 문서를 업데이트하세요
- ComfyUI의 확장 시스템과의 호환성을 보장하세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **ComfyUI 팀**: 훌륭한 프레임워크와 확장 시스템을 제공해 주셔서
- **Cookiecutter 템플릿**: 프로젝트 스캐폴딩을 제공해 주셔서
- **커뮤니티**: 피드백과 테스트를 제공해 주셔서

## 📞 지원

- **이슈**: 버그 보고와 기능 요청을 위해 GitHub Issues를 사용하세요
- **토론**: 커뮤니티 지원을 위해 [ComfyUI Discord](https://discord.com/invite/comfyorg)에 참여하세요
- **문서**: 일반적인 가이드라인을 위해 [ComfyUI 문서](https://docs.comfy.org/)를 확인하세요

---

**ComfyUI 커뮤니티를 위해 ❤️으로 만들어졌습니다**
