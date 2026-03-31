<template>
  <div class="absolute top-0 left-1/2 -translate-x-1/2 z-10">
    <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-[360px] shadow-sm search-shell">
      <input v-model="store.searchQuery" class="w-full bg-transparent text-sm text-slate-700 focus:outline-none" placeholder="搜索命令、描述、标签" />
    </div>
  </div>
  <div class="flex-1 overflow-auto pr-1 min-h-0 scroll-fade pb-24 pt-16">
    <div class="grid grid-cols-3 gap-4">
      <div
        v-if="store.selectedCollectionId && store.selectedCollection"
        class="card-panel card-fixed rounded-xl p-4 flex flex-col gap-3 w-[90%] justify-self-start relative stop-card-panel"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold truncate max-w-[16ch]">停止</h3>
            <p class="text-xs text-slate-500 truncate">点击停止时执行</p>
          </div>
        </div>
        <div class="text-xs font-mono text-slate-700 bg-white/80 border border-rose-200 rounded-md px-2 py-1 command-ellipsis">
          {{ collectionStopAction.command || '未设置停止命令（编辑集合可配置）' }}
        </div>
        <div class="flex items-center gap-2">
          <span class="card-chip uppercase">{{ collectionStopAction.shell || 'cmd' }}</span>
          <span class="card-chip">{{ collectionStopAction.useDedicatedTerminal ? '新终端' : '同终端' }}</span>
        </div>
        <div class="mt-auto flex items-center justify-center gap-3">
          <button class="icon-btn" @click="openStopActionEditor" title="编辑停止">
            <PencilIcon class="h-4 w-4" />
          </button>
          <button
            v-if="store.selectedCollection && isCollectionRunning(store.selectedCollection.id)"
            class="icon-btn icon-btn-danger"
            @click="stopActiveRun"
            title="执行停止"
          >
            <SquareIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        v-for="entry in displayCards"
        :key="`${entry.card.id}-${entry.index}`"
        class="card-panel card-fixed rounded-xl p-4 flex flex-col gap-3 w-[90%] justify-self-start relative"
        :class="entry.card.shell === 'ps' ? 'card-shell-ps' : entry.card.shell === 'bash' ? 'card-shell-bash' : 'card-shell-cmd'"
      >
        <div v-if="store.selectedCollectionId" class="order-badge">
          <button
            v-if="editingOrderId !== entry.index"
            class="order-badge-btn"
            @click.stop="editCollectionOrder(entry.index)"
            title="运行顺序"
          >
            {{ entry.index + 1 }}
          </button>
          <input
            v-else
            :ref="(el) => setOrderInputRef(entry.index, el)"
            :value="orderInputValue"
            class="order-badge-input"
            @input="onOrderInput($event.target.value)"
            @keyup.enter.stop="commitCollectionOrder(entry.index)"
            @keyup.esc.stop="cancelCollectionOrder"
            @blur="commitCollectionOrder(entry.index)"
          />
        </div>
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold truncate max-w-[16ch]">{{ entry.card.name }}</h3>
            <p class="text-xs text-slate-500 truncate">{{ entry.card.description || '暂无描述' }}</p>
          </div>
        </div>
        <div class="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 command-ellipsis">
          {{ entry.card.command }}
        </div>
        <div class="flex items-center gap-2">
          <span class="card-chip uppercase">{{ entry.card.shell || 'cmd' }}</span>
        </div>
        <div class="mt-auto flex items-center justify-center gap-3">
          <button
            v-if="isCardRunning(entry.card.id)"
            class="icon-btn icon-btn-danger"
            @click="stopActiveRun"
            title="停止"
          >
            <SquareIcon class="h-4 w-4" />
          </button>
          <button v-else class="icon-btn icon-btn-primary" @click="confirmRunCard(entry.card)" title="执行">
            <PlayIcon class="h-4 w-4" />
          </button>
          <button
            class="icon-btn"
            :class="isCardSelected(entry.card.id, entry.index) ? 'icon-btn-selected' : ''"
            @click="toggleSelectForCollection(entry.card.id, entry.index)"
            title="选中"
          >
            <CheckCircleIcon v-if="isCardSelected(entry.card.id, entry.index)" class="h-4 w-4" />
            <CircleIcon v-else class="h-4 w-4" />
          </button>
          <button class="icon-btn" @click="openCardModal(entry.card)" title="编辑">
            <PencilIcon class="h-4 w-4" />
          </button>
          <button class="icon-btn" @click="handleDuplicateCard(entry.card, entry.index)" title="复制">
            <CopyIcon class="h-4 w-4" />
          </button>
          <button class="icon-btn icon-btn-danger" @click="confirmDeleteCard(entry.card, entry.index)" title="删除">
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
  <section
    class="card-panel rounded-xl fixed right-6 bottom-6 w-[360px] max-h-[70vh] transition-all overflow-hidden"
    :class="logCollapsed ? 'p-3' : 'p-4 space-y-4'"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button class="icon-btn" @click="onToggleLogCollapsed" title="折叠/展开">
          <ChevronDownIcon class="h-4 w-4 transition-transform" :class="logCollapsed ? '-rotate-90' : ''" />
        </button>
        <h2 class="text-sm font-semibold text-slate-700">历史运行记录</h2>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="icon-btn"
          :class="isCollectionHistoryClearDisabled ? 'opacity-40 pointer-events-none' : ''"
          @click="clearCollectionHistoryLogs"
          title="清理历史"
        >
          <BroomIcon class="h-4 w-4" />
        </button>
        <span class="text-xs text-slate-500">{{ collectionHistoryLogs.length }} 条</span>
      </div>
    </div>
    <div v-if="!logCollapsed" class="space-y-3">
      <div class="log-box rounded-lg p-3 max-h-[320px] overflow-auto space-y-3">
        <template v-if="collectionHistoryLogs.length">
          <div
            v-for="run in collectionHistoryLogs"
            :key="run.id"
            class="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 space-y-1"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-slate-700 truncate">{{ run.targetName }}</p>
              <span
                class="text-xs"
                :class="
                  run.status === 'failed' || run.status === 'stopped'
                    ? 'text-rose-600'
                    : run.status === 'success'
                    ? 'text-emerald-600'
                    : 'text-indigo-600'
                "
              >
                {{ run.status }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500">开始：{{ formatDate(run.startedAt) }}</p>
            <p class="text-[11px] text-slate-500">
              结束：{{ run.endedAt ? formatDate(run.endedAt) : '运行中' }} · 耗时：{{ formatDuration(run.startedAt, run.endedAt) }}
            </p>
          </div>
        </template>
        <p v-else class="text-[11px] text-slate-500">暂无历史运行记录</p>
      </div>
    </div>
  </section>
  <div class="fab-group" :key="`fab-cards-${activePage}-${store.selectedCollectionId || 'all'}-${fabAnimKey}`">
    <button
      class="fab fab-bounce relative"
      @click="openCollectionModal(store.selectedCollection || undefined)"
      :title="store.selectedCollection ? '编辑集合' : '新建集合'"
    >
      <PencilIcon v-if="store.selectedCollection" class="h-5 w-5" />
      <FolderPlusIcon v-else class="h-5 w-5" />
      <span v-if="selectedCount" class="fab-badge">{{ selectedCount }}</span>
    </button>
    <button
      class="fab fab-danger fab-bounce relative"
      :class="selectedCount ? '' : 'opacity-40 pointer-events-none'"
      @click="confirmDeleteSelectedCards"
      title="批量删除卡片"
    >
      <TrashIcon class="h-5 w-5" />
      <span v-if="selectedCount" class="fab-badge">{{ selectedCount }}</span>
    </button>
    <button class="fab fab-alt fab-bounce" @click="openCardModal()" title="新建卡片">
      <SquarePlusIcon class="h-5 w-5" />
    </button>
    <button class="fab fab-bounce" @click="importData" title="导入 JSON">
      <ImportIcon class="h-5 w-5" />
    </button>
    <button class="fab fab-alt fab-bounce" @click="exportData" title="导出 JSON">
      <ExportIcon class="h-5 w-5" />
    </button>
    <button
      v-if="store.selectedCollection && isCollectionRunning(store.selectedCollection.id)"
      class="fab fab-danger fab-bounce"
      @click="stopActiveRun"
      title="停止运行"
    >
      <SquareIcon class="h-5 w-5" />
    </button>
    <button
      v-else-if="store.selectedCollection"
      class="fab fab-play fab-bounce"
      @click="runCollection(store.selectedCollection)"
      title="运行集合"
    >
      <PlayIcon class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup>
import {
  Play,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  Square,
  Circle,
  CheckCircle2,
  FolderPlus,
  Import,
  Upload,
  Plus,
  BrushCleaning
} from 'lucide-vue-next';

const PlayIcon = Play;
const PencilIcon = Pencil;
const CopyIcon = Copy;
const TrashIcon = Trash2;
const ChevronDownIcon = ChevronDown;
const SquareIcon = Square;
const CircleIcon = Circle;
const CheckCircleIcon = CheckCircle2;
const FolderPlusIcon = FolderPlus;
const ImportIcon = Import;
const ExportIcon = Upload;
const SquarePlusIcon = Plus;
const BroomIcon = BrushCleaning;

defineProps({
  store: { type: Object, required: true },
  displayCards: { type: Array, default: () => [] },
  collectionStopAction: { type: Object, required: true },
  openStopActionEditor: { type: Function, required: true },
  isCollectionRunning: { type: Function, required: true },
  stopActiveRun: { type: Function, required: true },
  editingOrderId: { type: [Number, null], default: null },
  editCollectionOrder: { type: Function, required: true },
  setOrderInputRef: { type: Function, required: true },
  orderInputValue: { type: String, default: '' },
  onOrderInput: { type: Function, required: true },
  commitCollectionOrder: { type: Function, required: true },
  cancelCollectionOrder: { type: Function, required: true },
  isCardRunning: { type: Function, required: true },
  confirmRunCard: { type: Function, required: true },
  isCardSelected: { type: Function, required: true },
  toggleSelectForCollection: { type: Function, required: true },
  openCardModal: { type: Function, required: true },
  handleDuplicateCard: { type: Function, required: true },
  confirmDeleteCard: { type: Function, required: true },
  logCollapsed: { type: Boolean, default: false },
  onToggleLogCollapsed: { type: Function, required: true },
  collectionHistoryLogs: { type: Array, default: () => [] },
  isCollectionHistoryClearDisabled: { type: Boolean, default: true },
  clearCollectionHistoryLogs: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  formatDuration: { type: Function, required: true },
  selectedCount: { type: Number, default: 0 },
  openCollectionModal: { type: Function, required: true },
  confirmDeleteSelectedCards: { type: Function, required: true },
  importData: { type: Function, required: true },
  exportData: { type: Function, required: true },
  runCollection: { type: Function, required: true },
  fabAnimKey: { type: [Number, String], default: 0 },
  activePage: { type: String, default: '' }
});
</script>
