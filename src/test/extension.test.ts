import * as assert from 'assert';
import * as vscode from 'vscode';
import { buildAllText, buildImportInfoArray, processingImportText, readDependency } from '../utils';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');
  test('import-1', async () => {
    const allText = await getText();
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'";
    const result = "import { getCenterPositionListConfig, getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(processingImportText(example, allText), result);
  });

  test('import-2', async () => {
    const allText = await getText();
    const example = "import {   getCenterPositionListConfig,   notExist } from '@/components/common/2D/buildConfigData'";
    const result = "import { getCenterPositionListConfig } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(processingImportText(example, allText), result);
  });

  test('import-3', async () => {
    const allText = await getText();
    const example = "import {   notExist1,   notExist2 } from '@/components/common/2D/buildConfigData'";
    const result = "";
    assert.strictEqual(processingImportText(example, allText), result);
  });

  test('As import-1', async () => {
    const allText = await getText();
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as get } from '@/components/common/2D/buildConfigData'";
    const result = "import { getCenterPositionListConfig } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(processingImportText(example, allText), result);
  });

  test('As import-2', async () => {
    const allText = await getText();
    const example = "import {   getCenterPositionListConfig,   getRightComponentConfigListConfig as componentArray } from '@/components/common/2D/buildConfigData'";
    const result = "import { getCenterPositionListConfig, getRightComponentConfigListConfig as componentArray } from '@/components/common/2D/buildConfigData'";
    assert.strictEqual(processingImportText(example, allText), result);
  });

  test('get not import text', async () => {
    const text = await getText();
    assert.strictEqual(
      processingImportText(`import { BuildConfig, CenterConfig, DynamicPanelStatusEvent, RightConfig as right } from '@/types'`, text),
      `import { BuildConfig, CenterConfig, DynamicPanelStatusEvent } from '@/types'`);
  });
});


async function getText() {
  const allText =
    `<script setup lang="ts">
import { watchArray } from '@vueuse/core'
import { defineAsyncComponent, onMounted, onUnmounted, provide, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCenterPositionListConfig } from '@/components/common/2D/buildConfigData'
import { getRightComponentConfigListConfig } from '@/components/common/2D/buildConfigData'
import { useStore } from '@/store'
import { BuildConfig, CenterConfig, DynamicPanelStatusEvent, RightConfig as right } from '@/types'
import eventBus from '@/utils/eventBus'

const props = defineProps<{ id: string }>()
const route = useRoute()
const router = useRouter()
const store = useStore()

const openDynamicPanelBuild = () => {
if (rightConfig.dynamicPanelConfig && Object.keys(rightConfig.dynamicPanelConfig).length > 0) {
store.commit('setBuildConfig', { componentId: props.id, dynamicPanelConfig: rightConfig.dynamicPanelConfig })
}
router.push(\`/dynamic-panel-build/\${route.params.id}\`)
}

const centerConfig: CenterConfig = getCenterPositionListConfig(props.id)

const rightConfig: RightConfig = getRightComponentConfigListConfig(props.id)

const componentMap = new Map()

const componentArray = ref<CenterConfig[]>([])

const globalBuildConfig = reactive<BuildConfig>({} as BuildConfig)

provide('buildConfig', globalBuildConfig)

onMounted(() => {
if (store.state.twoDimensionalModule.componentId === props.id) {
rightConfig.dynamicPanelConfig = store.state.twoDimensionalModule.dynamicBuildConfigMap
}
eventBus.on('changeDynamicPanelStatus', changeDynamicPanelStatus)
if (!rightConfig.dynamicPanelConfig) rightConfig.dynamicPanelConfig = {}
buildComponentMap(rightConfig.dynamicPanelConfig[Object.keys(rightConfig.dynamicPanelConfig)[0]])
})

onUnmounted(() => {
eventBus.off('changeDynamicPanelStatus', changeDynamicPanelStatus)
})

const changeDynamicPanelStatus = ({ id, status }: DynamicPanelStatusEvent) => {
if (id === props.id && rightConfig.dynamicPanelConfig) {
buildComponentMap(rightConfig.dynamicPanelConfig[status])
}
}

function buildComponentMap(buildConfig: BuildConfig | undefined) {
if (!buildConfig) return
Object.assign(globalBuildConfig, buildConfig)
componentArray.value = buildConfig.centerConfig.positionConfigList
}

watchArray(componentArray, (newValue) => {
componentMap.clear()
for (const item of newValue) {
let component = defineAsyncComponent(() => import(\`@/components/2D/\${item.url}/draw.vue\`))
componentMap.set(item.id, component)
}
})

function getComponentFromMap(id: string) {
return componentMap.get(id)
}

const panelRef = ref<HTMLDivElement | null>(null)

const refreshKey = ref(0)
const scaleX = ref(1)
const scaleY = ref(1)

watch(() => [centerConfig.w, globalBuildConfig?.centerConfig?.baseConfig.canvasWidth], () => {
scaleX.value = centerConfig.w / globalBuildConfig.centerConfig.baseConfig.canvasWidth
refreshKey.value++
})

watch(() => [centerConfig.h, globalBuildConfig?.centerConfig?.baseConfig.canvasHeight], () => {
scaleY.value = centerConfig.h / globalBuildConfig.centerConfig.baseConfig.canvasHeight
refreshKey.value++
})

</script>
<template>
<div ref="panelRef" class="panel" @dblclick="openDynamicPanelBuild">
<div class="component-container" :key="refreshKey">
  <div v-for="item in componentArray" :key="item.id"
    :style="{ position: 'absolute', left: item.x + 'px', top: item.y + 'px', width: item.w + 'px', height: item.h + 'px', transform: \`scale(\${scaleX}, \${scaleY})\`, transformOrigin: 'top left' }">
    <component :is="getComponentFromMap(item.id)" :key="item.key" :id="item.id" :item="item" :src="item.url">
    </component>
  </div>
</div>
</div>
</template>
<style scoped lang="scss">
.panel {
width: 100%;
height: 100%;
background-color: #394be94d;

& .component-container {
position: relative;
width: 100%;
height: 100%;
}
}
</style>
`;
  // 创建一个新的文本文档
  const doc = await vscode.workspace.openTextDocument({ content: allText });
  // 在新的文本编辑器中显示文档
  const editor = await vscode.window.showTextDocument(doc);
  let [_, importArray] = buildImportInfoArray(editor.document);
  const text = buildAllText(importArray.map(item => item.range), editor.document);
  return text;
}
