<template>
  <div class="h-screen bg-white text-slate-800 overflow-hidden">
    <div class="titlebar">
      <button class="titlebar-btn" @click="windowMinimize" title="最小化">
        <MinusIcon class="h-4 w-4" />
      </button>
      <button class="titlebar-btn" @click="windowToggleMaximize" title="最大化">
        <SquareIcon class="h-4 w-4" />
      </button>
      <button class="titlebar-btn close" @click="windowClose" title="关闭">
        <CloseIcon class="h-4 w-4" />
      </button>
    </div>
    <div class="grid grid-cols-[240px_1fr] h-[calc(100vh-36px)] bg-white overflow-hidden">
      <aside class="bg-white px-4 py-6 h-full min-h-0 flex flex-col overflow-hidden">
        <div class="mb-6 flex items-center gap-2">
          <div class="h-8 w-8 rounded-xl bg-indigo-600/10 border border-indigo-600/20"></div>
          <div>
            <h1 class="text-sm font-semibold tracking-wide text-slate-800">Terminal Helper</h1>
            <p class="text-[11px] text-slate-400">Command Cards</p>
          </div>
        </div>
        <nav class="space-y-1 mb-6 text-sm">
          <button
            class="w-full text-left px-3 py-2 rounded-md"
            :class="activePage === 'cards' && !store.selectedCollectionId ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'cards'; store.selectedCollectionId = null"
          >
            全部卡片
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md"
            :class="activePage === 'collections' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'collections'"
          >
            集合管理
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'settings' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'settings'"
          >
            <SettingsIcon class="h-4 w-4" />
            设置
          </button>
        </nav>
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>集合</span>
          <span>{{ store.collections.length }}</span>
        </div>
        <div class="mt-3 flex-1 min-h-0 overflow-auto pr-1 scroll-fade">
          <div class="space-y-1 text-sm">
            <button
              v-for="collection in store.collections"
              :key="collection.id"
              class="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50"
              :class="activePage === 'cards' && store.selectedCollectionId === collection.id ? 'bg-slate-100 text-slate-800' : 'text-slate-600'"
              @click="activePage = 'cards'; store.selectedCollectionId = collection.id"
            >
              <div class="flex items-center justify-between">
                <span class="truncate">{{ collection.name }}</span>
                <span class="text-xs text-slate-500">{{ collection.cardIds.length }}</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <div class="flex flex-col h-full min-h-0">
        <div class="px-6 py-4 flex-1 overflow-hidden min-h-0 main-divider">
          <main v-if="activePage === 'cards'" class="relative h-full flex flex-col min-h-0">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 z-10">
              <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-[360px] shadow-sm search-shell">
                <input v-model="store.searchQuery" class="w-full bg-transparent text-sm text-slate-700 focus:outline-none" placeholder="搜索命令、描述、标签" />
              </div>
            </div>
            <div class="flex-1 overflow-auto pr-1 min-h-0 scroll-fade pb-24 pt-16">
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="card in store.filteredCards"
                  :key="card.id"
                  class="card-panel card-fixed rounded-xl p-4 flex flex-col gap-3 w-[90%] justify-self-start relative"
                  :class="card.shell === 'ps' ? 'card-shell-ps' : card.shell === 'bash' ? 'card-shell-bash' : 'card-shell-cmd'"
                >
                  <div v-if="store.selectedCollectionId" class="order-badge">
                    <button
                      v-if="editingOrderId !== card.id"
                      class="order-badge-btn"
                      @click.stop="editCollectionOrder(card.id)"
                      title="运行顺序"
                    >
                      {{ collectionOrderMap[card.id] || '-' }}
                    </button>
                    <input
                      v-else
                      :ref="(el) => setOrderInputRef(card.id, el)"
                      v-model="orderInputValue"
                      class="order-badge-input"
                      @keyup.enter.stop="commitCollectionOrder(card.id)"
                      @keyup.esc.stop="cancelCollectionOrder"
                      @blur="commitCollectionOrder(card.id)"
                    />
                  </div>
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="text-lg font-semibold truncate max-w-[16ch]">{{ card.name }}</h3>
                      <p class="text-xs text-slate-500 truncate">{{ card.description || '暂无描述' }}</p>
                    </div>
                  </div>
                  <div class="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 command-ellipsis">
                    {{ card.command }}
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="card-chip uppercase">{{ card.shell || 'cmd' }}</span>
                  </div>
                  <div class="mt-auto flex items-center justify-center gap-3">
                    <button class="icon-btn icon-btn-primary" @click="confirmRunCard(card)" title="执行">
                      <PlayIcon class="h-4 w-4" />
                    </button>
                    <button
                      class="icon-btn"
                      :class="selectedForCollection.includes(card.id) ? 'icon-btn-selected' : ''"
                      @click="toggleSelectForCollection(card.id)"
                      title="选中"
                    >
                      <CheckCircleIcon v-if="selectedForCollection.includes(card.id)" class="h-4 w-4" />
                      <CircleIcon v-else class="h-4 w-4" />
                    </button>
                    <button class="icon-btn" @click="openCardModal(card)" title="编辑">
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    <button class="icon-btn" @click="store.duplicateCard(card)" title="复制">
                      <CopyIcon class="h-4 w-4" />
                    </button>
                    <button class="icon-btn icon-btn-danger" @click="confirmDeleteCard(card)" title="删除">
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
                  <button class="icon-btn" @click="logCollapsed = !logCollapsed" title="折叠/展开">
                    <ChevronDownIcon class="h-4 w-4 transition-transform" :class="logCollapsed ? '-rotate-90' : ''" />
                  </button>
                  <h2 class="text-sm font-semibold text-slate-700">日志面板</h2>
                </div>
                <span class="text-xs text-slate-500">{{ activeRun ? formatDuration(activeRun.startedAt, activeRun.endedAt) : '-' }}</span>
              </div>
              <div v-if="activeRun && !logCollapsed" class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ activeRun.targetName }}</p>
                    <p class="text-xs text-slate-500">{{ activeRun.targetType.toUpperCase() }}</p>
                  </div>
                  <span class="text-xs" :class="activeRun.status === 'failed' ? 'text-rose-600' : activeRun.status === 'success' ? 'text-emerald-600' : 'text-indigo-600'">
                    {{ activeRun.status }}
                  </span>
                </div>
                <div class="log-box rounded-lg p-3 max-h-[320px] overflow-auto">
                  <template v-if="activeRun.steps.length">
                    <div v-for="step in activeRun.steps" :key="step.id" class="space-y-2">
                      <p class="text-[11px] text-slate-500">{{ step.command }}</p>
                      <pre class="text-[11px] text-slate-700 whitespace-pre-wrap font-mono">{{ step.stdout }}</pre>
                      <pre v-if="step.stderr" class="text-[11px] text-rose-600 whitespace-pre-wrap font-mono">{{ step.stderr }}</pre>
                    </div>
                  </template>
                  <p v-else class="text-[11px] text-slate-500">暂无输出</p>
                </div>
              </div>
            </section>
            <div class="fab-group" :key="`fab-cards-${activePage}-${store.selectedCollectionId || 'all'}-${fabAnimKey}`">
              <button class="fab fab-bounce relative" @click="openCollectionModal()" title="新建集合">
                <FolderPlusIcon class="h-5 w-5" />
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
              <button v-if="store.selectedCollection" class="fab fab-play fab-bounce" @click="runCollection(store.selectedCollection)" title="运行集合">
                <PlayIcon class="h-5 w-5" />
              </button>
            </div>
          </main>
          <main v-else-if="activePage === 'collections'" class="space-y-4 h-full flex flex-col min-h-0">
            <div class="rounded-xl p-4 space-y-4 flex-1 overflow-auto min-h-0 scroll-fade">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-slate-700">集合列表</h3>
                  <p class="text-xs text-slate-400">管理集合与卡片排序</p>
                </div>
              </div>
              <div class="space-y-2">
                <div
                  v-for="collection in store.collections"
                  :key="collection.id"
                  class="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <button class="icon-btn" @click="toggleCollectionSelection(collection.id)" title="选择集合">
                      <CheckCircleIcon v-if="selectedCollections.includes(collection.id)" class="h-4 w-4 text-indigo-600" />
                      <CircleIcon v-else class="h-4 w-4 text-slate-400" />
                    </button>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-slate-700 truncate">{{ collection.name }}</p>
                      <p class="text-xs text-slate-400">{{ collection.cardIds.length }} 张卡片</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="icon-btn" @click="openCollectionModal(collection)" title="编辑">
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    <button class="icon-btn" @click="store.duplicateCollection(collection)" title="复制">
                      <CopyIcon class="h-4 w-4" />
                    </button>
                    <button class="icon-btn icon-btn-danger" @click="confirmDeleteCollection(collection)" title="删除">
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div v-if="store.collections.length === 0" class="text-sm text-slate-400 py-6 text-center">
                  还没有集合，点击“新建集合”开始。
                </div>
              </div>
            </div>
            <div class="fab-group" :key="`fab-collections-${activePage}-${fabAnimKey}`">
              <button class="fab fab-bounce relative" @click="openCollectionModal()" title="新建集合">
                <FolderPlusIcon class="h-5 w-5" />
                <span v-if="selectedCount" class="fab-badge">{{ selectedCount }}</span>
              </button>
              <button
                class="fab fab-danger fab-bounce relative"
                :class="selectedCollectionCount ? '' : 'opacity-40 pointer-events-none'"
                @click="confirmDeleteSelectedCollections"
                title="批量删除"
              >
                <TrashIcon class="h-5 w-5" />
                <span v-if="selectedCollectionCount" class="fab-badge">{{ selectedCollectionCount }}</span>
              </button>
            </div>
          </main>
          <main v-else class="space-y-4 h-full flex flex-col min-h-0">
            <div class="rounded-xl p-4 space-y-4 w-full flex-1 overflow-auto min-h-0 scroll-fade">
              <div>
                <h3 class="text-sm font-semibold text-slate-700">终端路径</h3>
                <p class="text-xs text-slate-400">自定义 CMD / PowerShell / Bash 的可执行路径</p>
              </div>
              <div class="space-y-3">
                <div class="space-y-1">
                  <label class="text-xs text-slate-500">CMD 路径</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settingsForm.cmd" class="input" placeholder="例如 C:\\Windows\\System32\\cmd.exe" />
                    <button class="icon-btn icon-btn-check" title="应用并检测 CMD 路径" @click="applyShell('cmd')">
                      <CheckIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-slate-500">PowerShell 路径</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settingsForm.ps" class="input" placeholder="例如 C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" />
                    <button class="icon-btn icon-btn-check" title="应用并检测 PowerShell 路径" @click="applyShell('ps')">
                      <CheckIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-slate-500">Bash 路径</label>
                  <div class="flex items-center gap-2">
                    <input v-model="settingsForm.bash" class="input" placeholder="例如 C:\\Program Files\\Git\\bin\\bash.exe" />
                    <button class="icon-btn icon-btn-check" title="应用并检测 Bash 路径" @click="applyShell('bash')">
                      <CheckIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex justify-end"></div>
            </div>
          </main>
        </div>
      </div>
    </div>

    <div v-if="cardModal.open" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/30" @click="cardModal.open = false"></div>
      <aside class="drawer-panel">
        <div class="drawer-header">
          <h3 class="text-lg font-semibold">{{ cardModal.mode === 'edit' ? '编辑卡片' : '新建卡片' }}</h3>
          <button class="icon-btn" @click="cardModal.open = false" title="关闭">
            <CloseIcon class="h-4 w-4" />
          </button>
        </div>
        <div class="drawer-body space-y-4 drawer-body-fill">
          <input v-model="cardModal.form.name" class="input" placeholder="卡片名称" />
          <textarea v-model="cardModal.form.command" class="input" placeholder="终端命令"></textarea>
          <textarea v-model="cardModal.form.description" class="input" placeholder="描述"></textarea>
          <div class="space-y-2">
            <label class="text-xs text-slate-500">运行终端</label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="btn px-4"
                :class="cardModal.form.shell === 'cmd' ? 'btn-toggle-active' : ''"
                @click="cardModal.form.shell = 'cmd'"
              >
                CMD
              </button>
              <button
                type="button"
                class="btn px-4"
                :class="cardModal.form.shell === 'ps' ? 'btn-toggle-active' : ''"
                @click="cardModal.form.shell = 'ps'"
              >
                PS
              </button>
              <button
                type="button"
                class="btn px-4"
                :class="cardModal.form.shell === 'bash' ? 'btn-toggle-active' : ''"
                @click="cardModal.form.shell = 'bash'"
              >
                BASH
              </button>
            </div>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="btn" @click="cardModal.open = false">取消</button>
          <button class="btn btn-primary" @click="saveCard">保存</button>
        </div>
      </aside>
    </div>

    <div v-if="collectionModal.open" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/30" @click="collectionModal.open = false"></div>
      <aside class="drawer-panel drawer-wide">
        <div class="drawer-header">
          <h3 class="text-lg font-semibold">{{ collectionModal.mode === 'edit' ? '编辑集合' : '新建集合' }}</h3>
          <button class="icon-btn" @click="collectionModal.open = false" title="关闭">
            <CloseIcon class="h-4 w-4" />
          </button>
        </div>
        <div class="drawer-body space-y-4">
          <input v-model="collectionModal.form.name" class="input" placeholder="集合名称" />
          <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 search-shell">
            <input v-model="collectionModal.search" class="w-full bg-transparent text-sm text-slate-700 focus:outline-none drawer-search-input" placeholder="搜索卡片" />
          </div>
          <div class="collection-split">
            <div class="collection-split-section">
              <p class="text-xs text-slate-500">所有卡片</p>
              <div class="collection-list-panel collection-fill">
                <div class="collection-list-inner space-y-2">
                <button
                  v-for="card in filteredCollectionCards"
                  :key="card.id"
                  type="button"
                  class="collection-add-item"
                  @click="addCardToCollectionDraft(card.id)"
                  
                >
                  <span class="hover-reveal-text" :title="card.name">{{ card.name }}</span>
                </button>
                </div>
              </div>
            </div>
            <div class="collection-split-section">
              <p class="text-xs text-slate-500">已选卡片</p>
              <div class="collection-list-panel collection-fill">
                <div class="collection-list-inner space-y-2">
                  <div
                    v-for="(cardId, index) in collectionModal.form.cardIds"
                    :key="`${cardId}-${index}`"
                    class="selected-row"
                  >
                    <span class="hover-reveal-text" :title="cardName(cardId)">{{ cardName(cardId) }}</span>
                    <button class="selected-remove" @click.stop="removeSelectedCard(index)" title="移除">
                      <CloseIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="btn" @click="collectionModal.open = false">取消</button>
          <button class="btn btn-primary" @click="saveCollection">保存</button>
        </div>
      </aside>
    </div>

    <div v-if="confirmModal.open" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
      <div class="card-panel rounded-xl p-6 w-[520px] space-y-4">
        <h3 class="text-lg font-semibold">{{ confirmModal.title }}</h3>
        <p class="text-sm text-slate-600">{{ confirmModal.message }}</p>
        <div class="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-2 whitespace-pre-wrap">
          {{ confirmModal.details }}
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn" @click="confirmModal.open = false">取消</button>
          <button class="btn btn-primary" @click="confirmModal.onConfirm">{{ confirmModal.confirmText }}</button>
        </div>
      </div>
    </div>
    <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div
        class="card-panel rounded-lg px-4 py-2 text-sm"
        :class="toast.tone === 'success' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : toast.tone === 'error' ? 'toast-error' : 'border-slate-200 text-slate-700 bg-white'"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue';
import {
  Play,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  Settings,
  Check,
  Plus,
  FolderPlus,
  Import,
  Upload,
  Minus,
  Square,
  X,
  Circle,
  CheckCircle2
} from 'lucide-vue-next';
import { useDataStore } from './modules/terminal/terminalStore';

const PlayIcon = Play;
const PencilIcon = Pencil;
const CopyIcon = Copy;
const TrashIcon = Trash2;
const ChevronDownIcon = ChevronDown;
const SettingsIcon = Settings;
const CheckIcon = Check;
const PlusIcon = Plus;
const FolderPlusIcon = FolderPlus;
const SquarePlusIcon = Plus;
const ImportIcon = Import;
const ExportIcon = Upload;
const MinusIcon = Minus;
const SquareIcon = Square;
const CloseIcon = X;
const CircleIcon = Circle;
const CheckCircleIcon = CheckCircle2;

const store = useDataStore();
const activePage = ref('cards');
const fabAnimKey = ref(0);
const logCollapsed = ref(false);
const settingsForm = reactive({ cmd: 'cmd.exe', ps: 'powershell.exe', bash: 'bash' });
const toast = reactive({ show: false, message: '', tone: 'info' });
const selectedForCollection = ref([]);
const selectedCollections = ref([]);
const editingOrderId = ref(null);
const orderInputValue = ref('');
const orderInputRefs = new Map();

const cardModal = reactive({
  open: false,
  mode: 'create',
  cardId: null,
  form: { name: '', command: '', description: '', shell: 'cmd' }
});

const collectionModal = reactive({
  open: false,
  mode: 'create',
  collectionId: null,
  form: { name: '', cardIds: [] },
  search: ''
});

const confirmModal = reactive({
  open: false,
  title: '',
  message: '',
  details: '',
  confirmText: '确认',
  onConfirm: () => {}
});

const activeRun = computed(() => store.runLogs.find((r) => r.id === store.activeRunId));
const selectedCount = computed(() => selectedForCollection.value.length);
const selectedCollectionCount = computed(() => selectedCollections.value.length);
const collectionOrderMap = computed(() => {
  const collection = store.selectedCollection;
  if (!collection) return {};
  return collection.cardIds.reduce((acc, id, index) => {
    acc[id] = index + 1;
    return acc;
  }, {});
});
const filteredCollectionCards = computed(() => {
  const query = collectionModal.search.trim().toLowerCase();
  if (!query) return store.cards;
  return store.cards.filter((card) => {
    return (
      card.name.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query) ||
      card.command.toLowerCase().includes(query)
    );
  });
});
const windowMaximized = ref(false);

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

function formatDuration(startedAt, endedAt) {
  if (!startedAt) return '-';
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const diff = Math.max(0, end - start);
  const minutes = Math.floor(diff / 60000);
  const ms = diff % 60000;
  return `${minutes}m ${ms}ms`;
}

function showToast(message, tone = 'info') {
  toast.message = message;
  toast.tone = tone;
  toast.show = true;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.show = false;
  }, 2000);
}

function syncSettingsForm() {
  const paths = store.settings?.shellPaths || {};
  settingsForm.cmd = paths.cmd || 'cmd.exe';
  settingsForm.ps = paths.ps || 'powershell.exe';
  settingsForm.bash = paths.bash || 'bash';
}

async function detectShell(kind) {
  const paths = await window.terminalHelper.detectShellPaths();
  if (!paths) return null;
  if (kind === 'cmd') return paths.cmd || 'cmd.exe';
  if (kind === 'ps') return paths.ps || 'powershell.exe';
  if (kind === 'bash') return paths.bash || 'bash';
  return null;
}

async function applyShell(kind) {
  const current = kind === 'cmd' ? settingsForm.cmd : kind === 'ps' ? settingsForm.ps : settingsForm.bash;
  const currentTrimmed = current ? current.trim() : '';
  if (currentTrimmed) {
    const valid = await window.terminalHelper.validateShellPath(currentTrimmed);
    if (!valid) {
      const label = kind === 'cmd' ? 'CMD' : kind === 'ps' ? 'PowerShell' : 'Bash';
      showToast(`${label} 未检测到该路径`, 'error');
      return;
    }
  }
  const detected = await detectShell(kind);
  const chosen = currentTrimmed || detected;
  if (kind === 'cmd') settingsForm.cmd = chosen || 'cmd.exe';
  if (kind === 'ps') settingsForm.ps = chosen || 'powershell.exe';
  if (kind === 'bash') settingsForm.bash = chosen || 'bash';
  store.settings.shellPaths = {
    cmd: settingsForm.cmd,
    ps: settingsForm.ps,
    bash: settingsForm.bash
  };
  store.persist();
  const label = kind === 'cmd' ? 'CMD' : kind === 'ps' ? 'PowerShell' : 'Bash';
  showToast(`${label} 路径已应用`, 'success');
}

function saveSettings() {
  store.settings.shellPaths = {
    cmd: settingsForm.cmd.trim() || 'cmd.exe',
    ps: settingsForm.ps.trim() || 'powershell.exe',
    bash: settingsForm.bash.trim() || 'bash'
  };
  store.persist();
}

function isAbsolutePath(value) {
  if (!value) return false;
  if (value.startsWith('/') || value.startsWith('\\\\')) return true;
  return /^[A-Za-z]:\\/.test(value);
}

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

async function windowMinimize() {
  await window.terminalHelper.windowMinimize();
}

async function windowToggleMaximize() {
  const state = await window.terminalHelper.windowToggleMaximize();
  windowMaximized.value = state;
}

async function windowClose() {
  await window.terminalHelper.windowClose();
}

function openCardModal(card) {
  if (card) {
    cardModal.mode = 'edit';
    cardModal.cardId = card.id;
    cardModal.form = {
      name: card.name,
      command: card.command,
      description: card.description,
      shell: card.shell || 'cmd'
    };
  } else {
    cardModal.mode = 'create';
    cardModal.cardId = null;
    cardModal.form = { name: '', command: '', description: '', shell: 'cmd' };
  }
  cardModal.open = true;
}

function saveCard() {
  const payload = {
    name: cardModal.form.name.trim(),
    command: cardModal.form.command.trim(),
    description: cardModal.form.description.trim(),
    shell: cardModal.form.shell || 'cmd'
  };
  if (!payload.name || !payload.command) return;
  if (cardModal.mode === 'edit') {
    store.updateCard(cardModal.cardId, payload);
  } else {
    const newId = store.addCard(payload);
    if (store.selectedCollectionId) {
      store.addCardsToCollection(store.selectedCollectionId, [newId]);
    }
  }
  cardModal.open = false;
}

function openCollectionModal(collection) {
  if (collection) {
    collectionModal.mode = 'edit';
    collectionModal.collectionId = collection.id;
    collectionModal.form = {
      name: collection.name,
      cardIds: [...collection.cardIds]
    };
  } else {
    collectionModal.mode = 'create';
    collectionModal.collectionId = null;
    collectionModal.form = { name: '', cardIds: [...selectedForCollection.value] };
  }
  collectionModal.search = '';
  collectionModal.open = true;
}

function saveCollection() {
  const payload = {
    name: collectionModal.form.name.trim(),
    cardIds: collectionModal.form.cardIds
  };
  if (!payload.name) {
    showToast('请输入集合名称', 'error');
    return;
  }
  if (collectionModal.mode === 'edit') {
    store.updateCollection(collectionModal.collectionId, payload);
  } else {
    store.addCollection(payload);
    selectedForCollection.value = [];
  }
  collectionModal.open = false;
  showToast('集合已保存', 'success');
}

function cardName(cardId) {
  const card = store.cards.find((c) => c.id === cardId);
  return card ? card.name : '未知卡片';
}

function addCardToCollectionDraft(cardId) {
  collectionModal.form.cardIds.push(cardId);
}

function hideHoverPreview() {
  clearTimeout(hoverHideTimer);
}
function removeSelectedCard(index) {
  collectionModal.form.cardIds.splice(index, 1);
}

function toggleSelectForCollection(cardId) {
  const index = selectedForCollection.value.indexOf(cardId);
  if (index >= 0) {
    selectedForCollection.value.splice(index, 1);
  } else {
    selectedForCollection.value.push(cardId);
  }
}

function confirmDeleteSelectedCards() {
  if (!selectedForCollection.value.length) return;
  const targets = selectedForCollection.value.slice();
  const names = targets.map((id) => {
    const card = store.cards.find((c) => c.id === id);
    return card ? card.name : '未知卡片';
  });
  confirmModal.title = '批量删除卡片';
  confirmModal.message = `确认删除选中的 ${targets.length} 张卡片吗？`;
  confirmModal.details = names.join('\n');
  confirmModal.confirmText = '确认删除';
  confirmModal.onConfirm = () => {
    targets.forEach((id) => store.deleteCard(id));
    selectedForCollection.value = [];
    confirmModal.open = false;
  };
  confirmModal.open = true;
}

function editCollectionOrder(cardId) {
  const collection = store.selectedCollection;
  if (!collection) return;
  const current = collectionOrderMap.value[cardId] || 1;
  editingOrderId.value = cardId;
  orderInputValue.value = String(current);
  nextTick(() => {
    const el = orderInputRefs.get(cardId);
    if (el) {
      el.focus();
      el.select();
    }
  });
}

function commitCollectionOrder(cardId) {
  const collection = store.selectedCollection;
  if (!collection) return;
  const total = collection.cardIds.length;
  const next = Number.parseInt(orderInputValue.value, 10);
  if (!Number.isFinite(next) || next < 1 || next > total) {
    showToast('请输入有效序号', 'error');
    return;
  }
  store.reorderCollectionCard(collection.id, cardId, next - 1);
  editingOrderId.value = null;
}

function cancelCollectionOrder() {
  editingOrderId.value = null;
}

function setOrderInputRef(cardId, el) {
  if (!el) {
    orderInputRefs.delete(cardId);
  } else {
    orderInputRefs.set(cardId, el);
  }
}
function toggleCollectionSelection(collectionId) {
  const index = selectedCollections.value.indexOf(collectionId);
  if (index >= 0) {
    selectedCollections.value.splice(index, 1);
  } else {
    selectedCollections.value.push(collectionId);
  }
}

function confirmDeleteSelectedCollections() {
  if (!selectedCollections.value.length) return;
  const targets = selectedCollections.value.slice();
  const names = targets.map((id) => {
    const collection = store.collections.find((c) => c.id === id);
    return collection ? collection.name : '未知集合';
  });
  confirmModal.title = '批量删除集合';
  confirmModal.message = `确认删除选中的 ${targets.length} 个集合吗？`;
  confirmModal.details = names.join('\n');
  confirmModal.confirmText = '确认删除';
  confirmModal.onConfirm = () => {
    targets.forEach((id) => store.deleteCollection(id));
    selectedCollections.value = [];
    confirmModal.open = false;
  };
  confirmModal.open = true;
}

function confirmDeleteCard(card) {
  confirmModal.title = '删除卡片';
  confirmModal.message = `确认删除卡片「${card.name}」吗？`;
  confirmModal.details = card.command;
  confirmModal.confirmText = '确认删除';
  confirmModal.onConfirm = () => {
    store.deleteCard(card.id);
    confirmModal.open = false;
  };
  confirmModal.open = true;
}

function confirmDeleteCollection(collection) {
  confirmModal.title = '删除集合';
  confirmModal.message = `确认删除集合「${collection.name}」吗？`;
  confirmModal.details = collection.cardIds.map(cardName).join('\n');
  confirmModal.confirmText = '确认删除';
  confirmModal.onConfirm = () => {
    store.deleteCollection(collection.id);
    confirmModal.open = false;
  };
  confirmModal.open = true;
}

function confirmRunCard(card) {
  confirmModal.title = '执行命令';
  confirmModal.message = `即将执行卡片「${card.name}」`;
  confirmModal.details = card.command;
  confirmModal.confirmText = '确认执行';
  confirmModal.onConfirm = async () => {
    confirmModal.open = false;
    await window.terminalHelper.runCard(toPlain(card));
  };
  confirmModal.open = true;
}

function runCollection(collection) {
  const cards = collection.cardIds.map((id) => store.cards.find((c) => c.id === id)).filter(Boolean);
  confirmModal.title = '运行集合';
  confirmModal.message = `即将按顺序执行集合「${collection.name}」`;
  confirmModal.details = cards.map((c) => c.command).join('\n');
  confirmModal.confirmText = '确认执行';
  confirmModal.onConfirm = async () => {
    confirmModal.open = false;
    await window.terminalHelper.runCollection(toPlain(collection), cards.map(toPlain));
  };
  confirmModal.open = true;
}

async function exportData() {
  if (store.selectedCollection) {
    const collection = store.selectedCollection;
    const cards = collection.cardIds.map((id) => store.cards.find((c) => c.id === id)).filter(Boolean);
    await window.terminalHelper.exportDataCustom({
      cards: cards.map(toPlain),
      collections: [toPlain(collection)],
      runLogs: [],
      settings: toPlain(store.settings)
    });
    return;
  }
  await window.terminalHelper.exportData();
}

async function importData() {
  if (store.selectedCollection) {
    const result = await window.terminalHelper.importDataRaw();
    if (!result || !result.ok) return;
    const data = result.data || {};
    const cards = Array.isArray(data.cards) ? data.cards : [];
    if (!cards.length) {
      showToast('导入文件没有卡片数据', 'error');
      return;
    }
    const newIds = [];
    cards.forEach((card) => {
      const newId = store.addCard({
        name: (card.name || '').toString(),
        command: (card.command || '').toString(),
        description: (card.description || '').toString(),
        shell: card.shell || 'cmd'
      });
      newIds.push(newId);
    });
    store.addCardsToCollection(store.selectedCollectionId, newIds);
    showToast(`已导入 ${newIds.length} 张卡片`, 'success');
    return;
  }
  const result = await window.terminalHelper.importData();
  if (result && result.ok) {
    await store.load();
    syncSettingsForm();
  }
}

onMounted(async () => {
  await store.load();
  syncSettingsForm();
  windowMaximized.value = await window.terminalHelper.windowIsMaximized();
  const paths = store.settings?.shellPaths || {};
  const needsDetect = !isAbsolutePath(paths.cmd) || !isAbsolutePath(paths.ps) || !isAbsolutePath(paths.bash);
  if (needsDetect) {
    const detected = await window.terminalHelper.detectShellPaths();
    if (detected) {
      settingsForm.cmd = detected.cmd || 'cmd.exe';
      settingsForm.ps = detected.ps || 'powershell.exe';
      settingsForm.bash = detected.bash || 'bash';
      store.settings.shellPaths = {
        cmd: settingsForm.cmd,
        ps: settingsForm.ps,
        bash: settingsForm.bash
      };
      store.persist();
    }
  }
  watch(
    () => activePage.value,
    (value) => {
      if (value === 'settings') {
        syncSettingsForm();
      }
      fabAnimKey.value += 1;
    }
  );
  window.terminalHelper.onRunBegin((payload) => {
    const targetName =
      payload.targetType === 'card'
        ? store.cards.find((c) => c.id === payload.targetId)?.name || '未知卡片'
        : store.collections.find((c) => c.id === payload.targetId)?.name || '未知集合';
    store.addRunLog({
      id: payload.runId,
      targetType: payload.targetType,
      targetId: payload.targetId,
      targetName,
      status: 'running',
      startedAt: payload.startedAt,
      endedAt: null,
      steps: []
    });
  });
  window.terminalHelper.onRunStepBegin((payload) => {
    const card = store.cards.find((c) => c.id === payload.cardId);
    store.addRunStep(payload.runId, {
      id: payload.stepId,
      cardId: payload.cardId,
      name: card ? card.name : '未知卡片',
      command: payload.command,
      status: 'running',
      startedAt: payload.startedAt,
      endedAt: null,
      exitCode: null,
      stdout: '',
      stderr: ''
    });
  });
  window.terminalHelper.onRunLog((payload) => {
    store.appendRunOutput(payload.runId, payload.stepId, payload.stream, payload.chunk);
  });
  window.terminalHelper.onRunStepEnd((payload) => {
    store.updateRunStep(payload.runId, payload.stepId, {
      status: payload.status,
      exitCode: payload.exitCode,
      endedAt: payload.endedAt
    });
  });
  window.terminalHelper.onRunEnd((payload) => {
    store.updateRun(payload.runId, {
      status: payload.status,
      endedAt: payload.endedAt
    });
  });
});
</script>
