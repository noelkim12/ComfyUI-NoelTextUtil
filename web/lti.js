import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// LoRA 이미지 데이터 저장
let loraImages = {};

// LoRA 이미지 목록 로드
async function loadLoraImages() {
    try {
        const response = await api.fetchApi('/pysssss/images/loras');
        const data = await response.json();
        loraImages = data;
        console.log('LoRA 이미지 목록 로드 완료:', Object.keys(data).length);
    } catch (error) {
        console.log('LoRA 이미지 목록 로드 실패 (pysssss.betterCombos 없음):', error.message);
        loraImages = {};
    }
}

// NoelLoRATriggerInjector 노드의 위젯 핸들러
function handleNoelLoRATriggerInjectorLoraCount(node, widget) {
    const count = Number(widget.value || 5);
    
    // 1부터 50까지의 LoRA 슬롯을 순회하며 표시/숨김 처리
    for (let i = 1; i <= 50; i++) {
        const nameWidget = findWidgetByName(node, `lora_${i}_name`);
        const triggerWidget = findWidgetByName(node, `lora_${i}_triggers`);
        
        const shouldShow = i <= count;
        
        if (nameWidget) {
            toggleWidget(node, nameWidget, shouldShow);
            // 숨김 처리 시 값을 초기화하여 혼란 방지
            if (!shouldShow) {
                nameWidget.value = "";
            }
        }
        
        if (triggerWidget) {
            toggleWidget(node, triggerWidget, shouldShow);
            // 숨김 처리 시 값을 초기화하여 혼란 방지
            if (!shouldShow) {
                triggerWidget.value = "";
            }
        }
    }
    
    // 노드 높이 업데이트 (ed_dynamicWidgets.js 스타일)
    updateNodeHeight(node);
}

// 위젯 찾기 함수 (ed_dynamicWidgets.js에서 가져옴)
function findWidgetByName(node, name) {
    return node.widgets?.find(w => w.name === name);
}

// 위젯 표시/숨김 함수 (ed_dynamicWidgets.js에서 가져옴)
function toggleWidget(node, widget, show) {
    if (widget) {
        widget.hidden = !show;
    }
}

// 동적 노드 높이 업데이트 함수 (ed_dynamicWidgets.js 스타일)
function updateNodeHeight(node) {
    if (!node) return;
    
    // 표시된 위젯들만 고려하여 높이 계산
    let visibleWidgets = 0;
    if (node.widgets) {
        visibleWidgets = node.widgets.filter(w => !w.hidden).length;
    }
    
    // 기본 노드 높이 + 각 위젯의 높이 (적정 크기로 조정)
    const baseHeight = 80; // 노드 헤더와 기본 여백
    const widgetHeight = 35; // 위젯당 평균 높이
    const calculatedHeight = baseHeight + (visibleWidgets * widgetHeight);
    
    // 계산된 높이를 실제로 적용
    node.setSize([node.size[0], calculatedHeight]);
}

// ed_betterCombos.js 스타일의 LoRA 이름 입력 위젯 생성
function createLoRANameInput(node, widgetName, index) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 5px;
    `;

    // 입력 필드
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `LoRA ${index} 이름 입력...`;
    input.style.cssText = `
        flex: 1;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 3px;
        background: #2a2a2a;
        color: #fff;
        font-size: 12px;
    `;

    // 드롭다운 버튼
    const dropdownBtn = document.createElement('button');
    dropdownBtn.innerHTML = '▼';
    dropdownBtn.style.cssText = `
        padding: 5px 8px;
        border: 1px solid #ccc;
        border-radius: 3px;
        background: #3a3a3a;
        color: #fff;
        cursor: pointer;
        font-size: 10px;
    `;

    // 드롭다운 메뉴
    const dropdown = document.createElement('div');
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #2a2a2a;
        border: 1px solid #ccc;
        border-radius: 3px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `;

    // 검색 필터
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'LoRA 검색...';
    filterInput.style.cssText = `
        width: 100%;
        padding: 5px;
        border: none;
        border-bottom: 1px solid #ccc;
        background: #2a2a2a;
        color: #fff;
        font-size: 12px;
        box-sizing: border-box;
    `;

    // 이미지 미리보기 요소
    const imagePreview = document.createElement('img');
    imagePreview.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        width: 384px;
        height: 384px;
        object-fit: contain;
        object-position: top left;
        z-index: 9999;
        display: none;
        background: #2a2a2a;
        border: 1px solid #ccc;
        border-radius: 3px;
    `;

    // 드롭다운 목록 업데이트
    function updateDropdownList(filter = '') {
        dropdown.innerHTML = '';
        dropdown.appendChild(filterInput);

        // LoRA 목록 가져오기
        const loraList = Object.keys(loraImages).filter(name => 
            name.toLowerCase().includes(filter.toLowerCase())
        );

        if (loraList.length === 0) {
            const noItem = document.createElement('div');
            noItem.textContent = 'LoRA를 찾을 수 없습니다';
            noItem.style.cssText = `
                padding: 8px 10px;
                color: #888;
                font-size: 12px;
                text-align: center;
            `;
            dropdown.appendChild(noItem);
            return;
        }

        loraList.forEach(loraName => {
            const item = document.createElement('div');
            item.textContent = loraName;
            item.style.cssText = `
                padding: 8px 10px;
                cursor: pointer;
                border-bottom: 1px solid #444;
                font-size: 12px;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 8px;
            `;

            // 이미지 아이콘 추가
            if (loraImages[loraName]) {
                const imgIcon = document.createElement('span');
                imgIcon.innerHTML = '🖼️';
                imgIcon.style.fontSize = '12px';
                item.appendChild(imgIcon);
            }

            item.addEventListener('mouseenter', () => {
                item.style.background = '#444';
                
                // 이미지 미리보기 표시
                if (loraImages[loraName]) {
                    imagePreview.src = `/pysssss/view/${encodeURIComponent(loraImages[loraName])}?${+new Date()}`;
                    imagePreview.style.display = 'block';
                    showImage(item, imagePreview);
                }
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
                imagePreview.style.display = 'none';
                imagePreview.remove();
            });

            item.addEventListener('click', () => {
                input.value = loraName;
                dropdown.style.display = 'none';
                imagePreview.style.display = 'none';
                imagePreview.remove();
                
                // 위젯 값 업데이트
                const widget = findWidgetByName(node, widgetName);
                if (widget) {
                    widget.value = loraName;
                }
            });

            dropdown.appendChild(item);
        });
    }

    // 이미지 위치 계산
    function showImage(el, imageEl) {
        const bodyRect = document.body.getBoundingClientRect();
        if (!bodyRect) return;

        let { top, left, right } = el.getBoundingClientRect();
        const { width: bodyWidth, height: bodyHeight } = bodyRect;

        const isSpaceRight = right + 384 <= bodyWidth;
        if (isSpaceRight) {
            left = right;
        } else {
            left -= 384;
        }

        top = top - 384 / 2;
        if (top + 384 > bodyHeight) {
            top = bodyHeight - 384;
        }
        if (top < 0) {
            top = 0;
        }

        imageEl.style.left = `${Math.round(left)}px`;
        imageEl.style.top = `${Math.round(top)}px`;

        if (isSpaceRight) {
            imageEl.classList.remove("left");
        } else {
            imageEl.classList.add("left");
        }

        document.body.appendChild(imageEl);
    }

    // 이벤트 리스너
    dropdownBtn.addEventListener('click', () => {
        if (dropdown.style.display === 'none') {
            dropdown.style.display = 'block';
            updateDropdownList();
            filterInput.focus();
        } else {
            dropdown.style.display = 'none';
            imagePreview.style.display = 'none';
            imagePreview.remove();
        }
    });

    filterInput.addEventListener('input', (e) => {
        updateDropdownList(e.target.value);
    });

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
            imagePreview.style.display = 'none';
            imagePreview.remove();
        }
    });

    // 입력 필드 값 변경 시 위젯 업데이트
    input.addEventListener('input', (e) => {
        const widget = findWidgetByName(node, widgetName);
        if (widget) {
            widget.value = e.target.value;
        }
    });

    // 초기 값 설정
    const widget = findWidgetByName(node, widgetName);
    if (widget && widget.value) {
        input.value = widget.value;
    }

    container.appendChild(input);
    container.appendChild(dropdownBtn);
    container.appendChild(dropdown);
    container.appendChild(imagePreview);

    return container;
}

// LoRA 이름 위젯을 ed_betterCombos.js 스타일로 변환
function enhanceLoRANameWidgets(node) {
    for (let i = 1; i <= 50; i++) {
        const nameWidget = findWidgetByName(node, `lora_${i}_name`);
        if (nameWidget && nameWidget.element) {
            // 기존 위젯 요소를 숨기고 새로운 입력 필드로 교체
            const originalElement = nameWidget.element;
            const parent = originalElement.parentElement;
            
            if (parent) {
                originalElement.style.display = 'none';
                const enhancedInput = createLoRANameInput(node, `lora_${i}_name`, i);
                parent.appendChild(enhancedInput);
            }
        }
    }
}

// 노드별 위젯 핸들러 매핑
const NODE_WIDGET_HANDLERS = {
    "NoelLoRATriggerInjector": {
        'lora_count': handleNoelLoRATriggerInjectorLoraCount
    }
};

// 위젯 로직 처리 함수
function widgetLogic(node, widget) {
    // 현재 노드와 위젯에 대한 핸들러 찾기
    const handler = NODE_WIDGET_HANDLERS[node.comfyClass]?.[widget.name];
    if (handler) {
        handler(node, widget);
    }
}

app.registerExtension({
    name: "Noel.LoRATriggerInjectorUI",
    
    async init() {
        // LoRA 이미지 목록 로드
        await loadLoraImages();
        
        // CSS 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .pysssss-combo-image {
                position: absolute;
                left: 0;
                top: 0;
                width: 384px;
                height: 384px;
                object-fit: contain;
                object-position: top left;
                z-index: 9999;
            }
            .pysssss-combo-image.left {
                object-position: top right;
            }
        `;
        document.head.appendChild(style);
    },
    
    nodeCreated(node) {
        if (node.comfyClass !== "NoelLoRATriggerInjector") return;
        
        if (node.widgets) {
            for (const w of node.widgets) {
                if (!NODE_WIDGET_HANDLERS[node.comfyClass]?.[w.name]) continue;
                
                let widgetValue = w.value;
                
                // 초기 위젯 상태 설정
                widgetLogic(node, w);
                
                Object.defineProperty(w, 'value', {
                    get() {
                        return widgetValue;
                    },
                    set(newVal) {
                        if (newVal !== widgetValue) {
                            widgetValue = newVal;
                            // 값 변경 시에만 핸들러 호출
                            widgetLogic(node, w);
                        }
                    }
                });
            }
        }

        // LoRA 이름 위젯을 ed_betterCombos.js 스타일로 향상
        setTimeout(() => {
            enhanceLoRANameWidgets(node);
        }, 100);
        
        // 노드 크기 재설정 방지를 위한 이벤트 리스너
        const originalSetSize = node.setSize;
        node.setSize = function(size) {
            // lora_count에 의한 위젯 숨김/표시 상태를 유지하면서 크기 설정
            const loraCountWidget = findWidgetByName(node, 'lora_count');
            if (loraCountWidget) {
                const count = Number(loraCountWidget.value || 5);
                let visibleWidgets = 0;
                
                if (node.widgets) {
                    // 현재 표시되어야 하는 위젯 수 계산
                    for (const w of node.widgets) {
                        if (w.name === 'lora_count' || w.name === 'context' || w.name === 'positive_prompt' || w.name === 'dedupe' || w.name === 'mode') {
                            visibleWidgets++;
                        } else {
                            // lora 슬롯 위젯들
                            const match = w.name.match(/^lora_(\d+)_(name|triggers)$/);
                            if (match) {
                                const slotIndex = parseInt(match[1]);
                                if (slotIndex <= count) {
                                    visibleWidgets++;
                                }
                            }
                        }
                    }
                }
                
                const baseHeight = 80;
                const widgetHeight = 35;
                const calculatedHeight = baseHeight + (visibleWidgets * widgetHeight);
                
                return originalSetSize.call(this, [size[0], calculatedHeight]);
            }
            
            return originalSetSize.call(this, size);
        };
    }
});
