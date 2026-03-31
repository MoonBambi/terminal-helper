<template>
  <div class="flex items-center justify-between mb-3 gap-4">
    <div>
      <h3 class="text-sm font-semibold text-slate-700">(=^･ω･^=)</h3>
      <p class="text-xs text-slate-400">ฅ^•ﻌ•^ฅ</p>
    </div>
    <div v-if="terminalTabs.length" class="terminal-tabs-strip">
      <div class="terminal-tabs" @wheel.prevent="handleTerminalTabsWheel">
        <div
          v-for="tab in terminalTabs"
          :key="tab.id"
          class="terminal-tab"
          :class="activeTerminalTabId === tab.id ? 'active' : ''"
          @click="switchTerminalTab(tab.id)"
        >
          <span class="terminal-tab-label">{{ tab.label }}</span>
          <button type="button" class="terminal-tab-close" title="关闭终端标签" @click.stop="closeTerminalTab(tab.id)">
            <CloseIcon class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="terminalTabs.length" class="terminal-stack flex-1 min-h-0">
    <div
      v-for="tab in terminalTabs"
      :key="`terminal-pane-${tab.id}`"
      v-show="activeTerminalTabId === tab.id"
      :ref="(el) => setTerminalContainerRef(tab.id, el)"
      class="terminal-container flex-1 min-h-0"
    ></div>
  </div>
  <div v-else class="terminal-empty flex-1 min-h-0">
    <p class="text-sm text-slate-500">暂无终端会话，运行集合后将自动创建。</p>
  </div>
  <div class="fab-group terminal-fab-group" :key="`fab-terminal-${activePage}-${fabAnimKey}`">
    <button
      class="fab fab-bounce"
      :class="activeTerminalTabId ? '' : 'opacity-40 pointer-events-none'"
      @click="clearActiveTerminalConnection"
      title="清除连接"
    >
      <BroomIcon class="h-5 w-5" />
    </button>
    <button
      class="fab fab-danger fab-bounce"
      :class="isRunActive ? '' : 'opacity-40 pointer-events-none'"
      @click="stopActiveRun"
      title="停止运行"
    >
      <SquareIcon class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup>
import { X, BrushCleaning, Square } from 'lucide-vue-next';

const CloseIcon = X;
const BroomIcon = BrushCleaning;
const SquareIcon = Square;

defineProps({
  terminalTabs: { type: Array, default: () => [] },
  activeTerminalTabId: { type: String, default: '' },
  handleTerminalTabsWheel: { type: Function, required: true },
  switchTerminalTab: { type: Function, required: true },
  closeTerminalTab: { type: Function, required: true },
  setTerminalContainerRef: { type: Function, required: true },
  activePage: { type: String, default: '' },
  fabAnimKey: { type: [Number, String], default: 0 },
  clearActiveTerminalConnection: { type: Function, required: true },
  isRunActive: { type: Boolean, default: false },
  stopActiveRun: { type: Function, required: true }
});
</script>
