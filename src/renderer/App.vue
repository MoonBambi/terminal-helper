<template>
  <div class="h-screen bg-white text-slate-800 overflow-hidden">
    <div class="titlebar">
      <div class="titlebar-brand">
        <button type="button" class="logo-button titlebar-logo" @click="playLogoAnimation" title="DumbOx">
          <svg
            :key="`logo-${logoAnimSeed}`"
            class="h-8 w-8 shrink-0 logo-spin-pop"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            shape-rendering="crispEdges"
          >
            <rect x="3" y="5" width="10" height="8" fill="#EEE8D5" />
            <rect x="2" y="4" width="2" height="2" fill="#586E75" />
            <rect x="12" y="4" width="2" height="2" fill="#586E75" />
            <rect x="5" y="7" width="2" height="2" fill="#002B36" />
            <rect x="9" y="7" width="2" height="2" fill="#002B36" />
            <rect x="5" y="10" width="6" height="3" fill="#2AA198" />
            <rect x="6" y="11" width="1" height="1" fill="#002B36" opacity="0.5" />
            <rect x="9" y="11" width="1" height="1" fill="#002B36" opacity="0.5" />
            <path d="M3 5H13V13H3V5Z" stroke="#002B36" stroke-width="1" fill="none" />
          </svg>
        </button>
        <h1 class="text-base font-semibold tracking-wide text-slate-800 leading-none">DumbOx</h1>
      </div>
      <div class="titlebar-actions">
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
    </div>
    <div class="grid grid-cols-[240px_1fr] h-[calc(100vh-36px)] bg-white overflow-hidden">
      <aside class="sidebar px-4 py-6 h-full min-h-0 flex flex-col overflow-hidden">
        <nav class="space-y-1 mb-6 text-sm">
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'board' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'board'; store.selectedCollectionId = null"
          >
            <BoardIcon class="h-4 w-4" />
            看板
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'library' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'library'; store.selectedCollectionId = null"
          >
            <LibraryIcon class="h-4 w-4" />
            资料库
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'qa' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'qa'; store.selectedCollectionId = null"
          >
            <QaIcon class="h-4 w-4" />
            问答
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'cards' && !store.selectedCollectionId ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'cards'; store.selectedCollectionId = null"
          >
            <AllCardsIcon class="h-4 w-4" />
            草料
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'collections' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'collections'"
          >
            <CollectionsIcon class="h-4 w-4" />
            牛群
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'tasks' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'tasks'"
          >
            <TasksIcon class="h-4 w-4" />
            耕地
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'terminal' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'terminal'"
          >
            <TerminalIcon class="h-4 w-4" />
            老牛工位
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'settings' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'settings'"
          >
            <SettingsIcon class="h-4 w-4" />
            牛棚配置
          </button>
        </nav>
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>牛群</span>
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

      <div class="flex flex-col h-full min-h-0" :class="activePage === 'terminal' ? 'terminal-shell' : ''">
        <div
          class="flex-1 overflow-hidden min-h-0 main-divider"
          :class="activePage === 'terminal' ? 'px-0 py-0 terminal-outer' : 'px-6 py-4'"
        >
          <main v-if="activePage === 'board'" class="h-full min-h-0 overflow-auto pr-1 scroll-fade">
            <BoardView
              :board-sentiment-distribution="boardSentimentDistribution"
              :board-total-news="boardTotalNews"
              :board-average-sentiment="boardAverageSentiment"
              :board-extreme-sentiment-count="boardExtremeSentimentCount"
              :board-sentiment-word-cloud="boardSentimentWordCloud"
              :set-board-sentiment-chart-ref="setBoardSentimentChartRef"
              :set-board-trend-chart-ref="setBoardTrendChartRef"
              :set-board-source-chart-ref="setBoardSourceChartRef"
            />
          </main>
          <main v-else-if="activePage === 'library'" class="h-full min-h-0 flex flex-col gap-4 overflow-hidden">
            <LibraryView
              :library-query="libraryQuery"
              :library-loading="libraryLoading"
              :library-items="libraryItems"
              :library-total="libraryTotal"
              :library-page="libraryPage"
              :library-total-pages="libraryTotalPages"
              :expanded-library-id="expandedLibraryId"
              :on-query-change="updateLibraryQuery"
              :on-toggle-expand="toggleLibraryExpand"
              :on-page-change="changeLibraryPage"
            />
          </main>
          <main v-else-if="activePage === 'qa'" class="h-full min-h-0 flex flex-col gap-3">
            <QaView
              :qa-cave-lines="qaCaveLines"
              :qa-input="qaInput"
              :qa-loading="qaLoading"
              :on-input="updateQaInput"
              :on-send="sendQaInput"
            />
          </main>
          <main v-else-if="activePage === 'cards'" class="relative h-full flex flex-col min-h-0">
            <CardsView
              :store="store"
              :display-cards="displayCards"
              :collection-stop-action="collectionStopAction"
              :open-stop-action-editor="openStopActionEditor"
              :is-collection-running="isCollectionRunning"
              :stop-active-run="stopActiveRun"
              :editing-order-id="editingOrderId"
              :edit-collection-order="editCollectionOrder"
              :set-order-input-ref="setOrderInputRef"
              :order-input-value="orderInputValue"
              :on-order-input="updateOrderInput"
              :commit-collection-order="commitCollectionOrder"
              :cancel-collection-order="cancelCollectionOrder"
              :is-card-running="isCardRunning"
              :confirm-run-card="confirmRunCard"
              :is-card-selected="isCardSelected"
              :toggle-select-for-collection="toggleSelectForCollection"
              :open-card-modal="openCardModal"
              :handle-duplicate-card="handleDuplicateCard"
              :confirm-delete-card="confirmDeleteCard"
              :log-collapsed="logCollapsed"
              :on-toggle-log-collapsed="toggleLogCollapsed"
              :collection-history-logs="collectionHistoryLogs"
              :is-collection-history-clear-disabled="isCollectionHistoryClearDisabled"
              :clear-collection-history-logs="clearCollectionHistoryLogs"
              :format-date="formatDate"
              :format-duration="formatDuration"
              :selected-count="selectedCount"
              :open-collection-modal="openCollectionModal"
              :confirm-delete-selected-cards="confirmDeleteSelectedCards"
              :import-data="importData"
              :export-data="exportData"
              :run-collection="runCollection"
              :fab-anim-key="fabAnimKey"
              :active-page="activePage"
            />
          </main>
          <main v-else-if="activePage === 'collections'" class="space-y-4 h-full flex flex-col min-h-0">
            <CollectionsView
              :store="store"
              :collection-search-query="collectionSearchQuery"
              :on-collection-search="updateCollectionSearch"
              :filtered-collections="filteredCollections"
              :toggle-collection-selection="toggleCollectionSelection"
              :selected-collections="selectedCollections"
              :open-collection-modal="openCollectionModal"
              :confirm-delete-collection="confirmDeleteCollection"
              :selected-count="selectedCount"
              :selected-collection-count="selectedCollectionCount"
              :confirm-delete-selected-collections="confirmDeleteSelectedCollections"
              :import-data="importData"
              :export-data="exportData"
              :fab-anim-key="fabAnimKey"
              :active-page="activePage"
            />
          </main>
          <main v-else-if="activePage === 'tasks'" class="space-y-4 h-full flex flex-col min-h-0">
            <TasksView
              :store="store"
              :task-search-query="taskSearchQuery"
              :on-task-search="updateTaskSearch"
              :filtered-tasks="filteredTasks"
              :task-run-status="taskRunStatus"
              :latest-task-run="latestTaskRun"
              :task-progress-percent="taskProgressPercent"
              :task-progress-tone="taskProgressTone"
              :task-progress-text="taskProgressText"
              :task-collections-text="taskCollectionsText"
              :is-run-active="isRunActive"
              :is-task-running="isTaskRunning"
              :run-task="runTask"
              :open-task-modal="openTaskModal"
              :confirm-delete-task="confirmDeleteTask"
              :task-completed-badges="taskCompletedBadges"
              :task-done-anim-seed="taskDoneAnimSeed"
              :task-history-collapsed="taskHistoryCollapsed"
              :on-toggle-task-history-collapsed="toggleTaskHistoryCollapsed"
              :is-task-history-clear-disabled="isTaskHistoryClearDisabled"
              :clear-task-history-logs="clearTaskHistoryLogs"
              :task-history-logs="taskHistoryLogs"
              :task-history-tone="taskHistoryTone"
              :format-date="formatDate"
              :format-duration="formatDuration"
              :fab-anim-key="fabAnimKey"
              :active-page="activePage"
            />
          </main>
          <main v-show="activePage === 'terminal'" class="space-y-4 h-full flex flex-col min-h-0 terminal-panel pt-8 pl-8 pr-4 pb-4">
            <TerminalView
              :terminal-tabs="terminalTabs"
              :active-terminal-tab-id="activeTerminalTabId"
              :handle-terminal-tabs-wheel="handleTerminalTabsWheel"
              :switch-terminal-tab="switchTerminalTab"
              :close-terminal-tab="closeTerminalTab"
              :set-terminal-container-ref="setTerminalContainerRef"
              :active-page="activePage"
              :fab-anim-key="fabAnimKey"
              :clear-active-terminal-connection="clearActiveTerminalConnection"
              :is-run-active="isRunActive"
              :stop-active-run="stopActiveRun"
            />
          </main>
          <main v-if="activePage === 'settings'" class="space-y-4 h-full flex flex-col min-h-0">
            <SettingsView
              :settings-form="settingsForm"
              :apply-shell="applyShell"
              :apply-qwen-settings="applyQwenSettings"
            />
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
          <div class="space-y-2">
            <p class="text-xs text-slate-500">停止（点击停止时执行）</p>
            <textarea v-model="collectionModal.form.stopAction.command" class="input" placeholder="例如 taskkill /IM node.exe /T /F"></textarea>
            <div class="space-y-2">
              <label class="text-xs text-slate-500">停止命令终端</label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="btn px-4"
                  :class="collectionModal.form.stopAction.shell === 'cmd' ? 'btn-toggle-active' : ''"
                  @click="collectionModal.form.stopAction.shell = 'cmd'"
                >
                  CMD
                </button>
                <button
                  type="button"
                  class="btn px-4"
                  :class="collectionModal.form.stopAction.shell === 'ps' ? 'btn-toggle-active' : ''"
                  @click="collectionModal.form.stopAction.shell = 'ps'"
                >
                  PS
                </button>
                <button
                  type="button"
                  class="btn px-4"
                  :class="collectionModal.form.stopAction.shell === 'bash' ? 'btn-toggle-active' : ''"
                  @click="collectionModal.form.stopAction.shell = 'bash'"
                >
                  BASH
                </button>
              </div>
            </div>
            <label class="flex items-center gap-2 text-xs text-slate-600">
              <input v-model="collectionModal.form.stopAction.useDedicatedTerminal" type="checkbox" />
              使用新终端执行停止命令（推荐）
            </label>
          </div>
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

    <div v-if="taskModal.open" class="fixed inset-0 z-[60]">
      <div class="absolute inset-0 bg-black/30" @click="taskModal.open = false"></div>
      <aside class="drawer-panel drawer-wide">
        <div class="drawer-header">
          <h3 class="text-lg font-semibold">{{ taskModal.mode === 'edit' ? '编辑任务' : '新建任务' }}</h3>
          <button class="icon-btn" @click="taskModal.open = false" title="关闭">
            <CloseIcon class="h-4 w-4" />
          </button>
        </div>
        <div class="drawer-body space-y-4">
          <input v-model="taskModal.form.name" class="input" placeholder="任务名称" />
          <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 search-shell">
            <input v-model="taskModal.search" class="w-full bg-transparent text-sm text-slate-700 focus:outline-none drawer-search-input" placeholder="搜索集合" />
          </div>
          <div class="collection-split">
            <div class="collection-split-section">
              <p class="text-xs text-slate-500">所有集合</p>
              <div class="collection-list-panel collection-fill">
                <div class="collection-list-inner space-y-2">
                  <button
                    v-for="collection in filteredTaskCollections"
                    :key="collection.id"
                    type="button"
                    class="collection-add-item"
                    @click="addCollectionToTaskDraft(collection.id)"
                  >
                    <span class="hover-reveal-text" :title="collection.name">{{ collection.name }}</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="collection-split-section">
              <p class="text-xs text-slate-500">已选集合</p>
              <div class="collection-list-panel collection-fill">
                <div class="collection-list-inner space-y-2">
                  <div
                    v-for="(collectionId, index) in taskModal.form.collectionIds"
                    :key="`${collectionId}-${index}`"
                    class="selected-row"
                  >
                    <span class="hover-reveal-text" :title="collectionName(collectionId)">{{ collectionName(collectionId) }}</span>
                    <button class="selected-remove" @click.stop="removeSelectedCollection(index)" title="移除">
                      <CloseIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="drawer-footer">
          <button class="btn" @click="taskModal.open = false">取消</button>
          <button class="btn btn-primary" @click="saveTask">保存</button>
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
import { computed, onMounted, onUnmounted, reactive, ref, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import {
  Settings,
  Minus,
  Square,
  X,
  Terminal,
  LayoutGrid,
  FolderKanban,
  ListTodo,
  BookOpen,
  PieChart,
  MessageSquare
} from 'lucide-vue-next';
import BoardView from './modules/board/BoardView.vue';
import LibraryView from './modules/library/LibraryView.vue';
import QaView from './modules/qa/QaView.vue';
import CardsView from './modules/cards/CardsView.vue';
import CollectionsView from './modules/collections/CollectionsView.vue';
import TasksView from './modules/tasks/TasksView.vue';
import TerminalView from './modules/terminal/TerminalView.vue';
import SettingsView from './modules/settings/SettingsView.vue';
import { useDataStore } from './modules/terminal/terminalStore';

const SettingsIcon = Settings;
const MinusIcon = Minus;
const SquareIcon = Square;
const CloseIcon = X;
const TerminalIcon = Terminal;
const AllCardsIcon = LayoutGrid;
const BoardIcon = PieChart;
const CollectionsIcon = FolderKanban;
const TasksIcon = ListTodo;
const LibraryIcon = BookOpen;
const QaIcon = MessageSquare;

const store = useDataStore();
const activePage = ref('board');
const logoAnimSeed = ref(0);
const fabAnimKey = ref(0);
const logCollapsed = ref(false);
const qaInput = ref('');
const qaCaveLines = ref([]);
const qaLoading = ref(false);
const libraryItems = ref([]);
const libraryQuery = ref('');
const libraryPage = ref(1);
const libraryPageSize = ref(12);
const libraryTotal = ref(0);
const libraryLoading = ref(false);
const librarySearchTimer = ref(null);
const expandedLibraryId = ref(null);
const settingsForm = reactive({
  cmd: 'cmd.exe',
  ps: 'powershell.exe',
  bash: 'bash',
  qwenApiKey: '',
  qwenBaseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  qwenModel: 'qwen-plus'
});
const toast = reactive({ show: false, message: '', tone: 'info' });
const selectedForCollection = ref([]);
const selectedCollections = ref([]);
const editingOrderId = ref(null);
const orderInputValue = ref('');
const orderInputRefs = new Map();
const collectionSearchQuery = ref('');
const taskSearchQuery = ref('');
const taskDoneAnimSeed = ref(0);
const taskHistoryCollapsed = ref(false);
const terminalTabs = ref([]);
const terminalTabSeed = ref(0);
const activeTerminalTabId = ref('');
const terminalContainerRefs = new Map();
const terminalStates = new Map();
const collectionRunTabByRunId = new Map();
const pendingCollectionRunTab = ref(null);
const pendingCardRunTab = ref(null);
const boardSentimentChartRef = ref(null);
const boardTrendChartRef = ref(null);
const boardSourceChartRef = ref(null);
let boardSentimentChart = null;
let boardTrendChart = null;
let boardSourceChart = null;

const setBoardSentimentChartRef = (el) => {
  boardSentimentChartRef.value = el;
};
const setBoardTrendChartRef = (el) => {
  boardTrendChartRef.value = el;
};
const setBoardSourceChartRef = (el) => {
  boardSourceChartRef.value = el;
};

function playLogoAnimation() {
  logoAnimSeed.value += 1;
}

async function sendQaInput() {
  const text = qaInput.value.trim();
  if (!text || qaLoading.value) return;
  qaInput.value = '';
  qaLoading.value = true;
  qaCaveLines.value = [`你：${text}`, '答：思考中...'];
  try {
    if (!window.terminalHelper || typeof window.terminalHelper.askQa !== 'function') {
      throw new Error('问答接口不可用');
    }
    const result = await window.terminalHelper.askQa(text);
    if (!result || !result.ok) {
      throw new Error((result && result.error) || '问答失败');
    }
    qaCaveLines.value = [`你：${text}`, `答：${result.answer || '（空回复）'}`];
  } catch (error) {
    const message = error && error.message ? error.message : '问答失败';
    qaCaveLines.value = [`你：${text}`, `答：${message}`];
    showToast(message, 'error');
  } finally {
    qaLoading.value = false;
  }
}

function updateQaInput(value) {
  qaInput.value = value;
}

function updateLibraryQuery(value) {
  libraryQuery.value = value;
}

function toggleLibraryExpand(id) {
  expandedLibraryId.value = expandedLibraryId.value === id ? null : id;
}

function updateOrderInput(value) {
  orderInputValue.value = value;
}

function updateCollectionSearch(value) {
  collectionSearchQuery.value = value;
}

function updateTaskSearch(value) {
  taskSearchQuery.value = value;
}

function toggleLogCollapsed() {
  logCollapsed.value = !logCollapsed.value;
}

function toggleTaskHistoryCollapsed() {
  taskHistoryCollapsed.value = !taskHistoryCollapsed.value;
}

async function loadLibraryPage() {
  if (!window.terminalHelper || typeof window.terminalHelper.fetchLibraryData !== 'function') return;
  libraryLoading.value = true;
  try {
    const result = await window.terminalHelper.fetchLibraryData({
      page: libraryPage.value,
      pageSize: libraryPageSize.value,
      query: libraryQuery.value
    });
    if (!result || !result.ok) {
      throw new Error((result && result.error) || '资料库加载失败');
    }
    libraryItems.value = Array.isArray(result.items) ? result.items : [];
    libraryTotal.value = Number(result.total || 0);
  } catch (error) {
    const message = error && error.message ? error.message : '资料库加载失败';
    libraryItems.value = [];
    libraryTotal.value = 0;
    showToast(message, 'error');
  } finally {
    libraryLoading.value = false;
  }
}

function changeLibraryPage(nextPage) {
  const target = Math.max(1, Math.min(nextPage, libraryTotalPages.value));
  if (target === libraryPage.value) return;
  libraryPage.value = target;
  loadLibraryPage();
}

const boardTone = Object.freeze({
  positive: '#859900',
  neutral: '#B58900',
  negative: '#DC322F',
  volume: '#268BD2'
});

const boardNewsFallback = [
  { id: 1, publish_date: '2026-03-06', source: '川观新闻', sentiment_score: 0.92, keywords: ['土地流转', '经营权', '集体经济', '乡村振兴'] },
  { id: 2, publish_date: '2025-12-17', source: '中国日报网', sentiment_score: 0.95, keywords: ['宅基地改革', '流转费', '农业增收'] },
  { id: 3, publish_date: '2025-09-12', source: '鲁网', sentiment_score: 0.95, keywords: ['土地流转', '承包权', '经营权'] },
  { id: 4, publish_date: '2025-09-04', source: '中国日报网', sentiment_score: 0.95, keywords: ['土地流转', '经营权', '集约化'] },
  { id: 5, publish_date: '2025-08-01', source: '周口网', sentiment_score: 0.92, keywords: ['土地流转', '承包权', '农村合作社'] },
  { id: 6, publish_date: '2025-05-22', source: '中国日报网', sentiment_score: 0.50, keywords: ['土地政策', '农村发展'] },
  { id: 7, publish_date: '2025-04-11', source: '经济日报', sentiment_score: 0.92, keywords: ['土地流转', '经营权', '乡村振兴'] },
  { id: 8, publish_date: '2025-03-20', source: '中国新闻网', sentiment_score: 0.75, keywords: ['土地流转', '承包权', '市场化'] },
  { id: 9, publish_date: '2025-02-23', source: '新华社', sentiment_score: 0.95, keywords: ['承包权', '经营权', '集体产权'] },
  { id: 10, publish_date: '2024-03-29', source: '中国日报网', sentiment_score: 0.95, keywords: ['土地流转', '经营权', '高标准农田'] },
  { id: 11, publish_date: '2025-12-29', source: '中国日报网', sentiment_score: 0.95, keywords: ['公司制改制', '集体协同', '农业产业'] },
  { id: 12, publish_date: '2025-12-29', source: '半岛网', sentiment_score: 0.95, keywords: ['土地流转', '经营权', '农业项目'] },
  { id: 13, publish_date: '2025-12-23', source: '中国日报网', sentiment_score: 0.92, keywords: ['承包权', '经营权', '流转费'] },
  { id: 14, publish_date: '2025-12-11', source: '中国日报网', sentiment_score: 0.95, keywords: ['土地确权证', '代养模式', '增收'] },
  { id: 15, publish_date: '2025-10-25', source: '中国日报网', sentiment_score: 0.92, keywords: ['土地纠纷', '承包权', '流转规范'] },
  { id: 16, publish_date: '2025-10-16', source: '半岛网', sentiment_score: 0.92, keywords: ['土地流转', '经营权', '农业现代化'] },
  { id: 17, publish_date: '2025-10-11', source: '鲁网', sentiment_score: 0.92, keywords: ['承包权', '经营权', '流转费'] },
  { id: 18, publish_date: '2025-10-11', source: '中国日报网', sentiment_score: 0.92, keywords: ['土地确权', '承包权', '流转费'] },
  { id: 19, publish_date: '2025-09-30', source: '东方网', sentiment_score: 0.90, keywords: ['土地流转', '经营权', '承包权'] },
  { id: 20, publish_date: '2025-09-23', source: '中国日报网', sentiment_score: 0.90, keywords: ['土地确权', '承包权', '流转费'] },
  { id: 21, publish_date: '2026-01-15', source: '中国日报网', sentiment_score: 0.95, keywords: ['林权流转', '经营权', '集体经济'] },
  { id: 22, publish_date: '2026-01-09', source: '光明网融媒频道', sentiment_score: 0.92, keywords: ['土地流转', '经营权', '承包权'] },
  { id: 23, publish_date: '2025-12-02', source: '半岛网', sentiment_score: 0.95, keywords: ['承包权', '经营权', '流转费'] },
  { id: 24, publish_date: '2025-11-04', source: '半岛网', sentiment_score: 0.50, keywords: ['土地纠纷', '确权争议', '基层治理'] },
  { id: 25, publish_date: '2025-08-15', source: '鲁网', sentiment_score: 0.35, keywords: ['土地纠纷', '流转争议', '权益冲突'] },
  { id: 26, publish_date: '2025-08-12', source: '日照新闻网', sentiment_score: 0.90, keywords: ['土地承包经营权', '经营权', '农户增收'] }
];

const boardWordFreqFallback = [
  { word: '发展', count: 64070 },
  { word: '农业', count: 53399 },
  { word: '乡村', count: 41738 },
  { word: '农村', count: 39500 },
  { word: '建设', count: 38360 },
  { word: '产业', count: 37155 },
  { word: '种植', count: 24447 },
  { word: '服务', count: 22584 },
  { word: '提升', count: 22531 },
  { word: '实现', count: 22330 },
  { word: '振兴', count: 21203 },
  { word: '推动', count: 20581 },
  { word: '土地', count: 20071 },
  { word: '企业', count: 18570 },
  { word: '农民', count: 18296 },
  { word: '创新', count: 17774 },
  { word: '技术', count: 17581 },
  { word: '生产', count: 16976 },
  { word: '项目', count: 16670 },
  { word: '改革', count: 15491 },
  { word: '村民', count: 15207 },
  { word: '中国', count: 14872 },
  { word: '模式', count: 14098 },
  { word: '科技', count: 13611 },
  { word: '资源', count: 12887 },
  { word: '农户', count: 12833 },
  { word: '实施', count: 12768 }
];

const boardNewsData = ref([]);
const boardWordFreqData = ref([]);
const boardDataLoaded = ref(false);
const boardNewsTable = computed(() => (boardDataLoaded.value ? boardNewsData.value : boardNewsFallback));
const boardWordFreqTable = computed(() => (boardDataLoaded.value ? boardWordFreqData.value : boardWordFreqFallback));

function boardSentimentKey(score) {
  if (score > 0.6) return 'positive';
  if (score >= 0.4) return 'neutral';
  return 'negative';
}

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
  form: {
    name: '',
    cardIds: [],
    stopAction: { name: '停止', command: '', shell: 'cmd', useDedicatedTerminal: true }
  },
  search: ''
});

const taskModal = reactive({
  open: false,
  mode: 'create',
  taskId: null,
  form: {
    name: '',
    collectionIds: []
  },
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
const isRunActive = computed(() => activeRun.value && activeRun.value.status === 'running');
const collectionHistoryLogs = computed(() => {
  const selectedCollectionId = store.selectedCollectionId;
  if (selectedCollectionId) {
    return store.runLogs.filter((run) => run.targetType === 'collection' && run.targetId === selectedCollectionId);
  }
  return store.runLogs;
});
const selectedCount = computed(() => selectedForCollection.value.length);
const selectedCollectionCount = computed(() => selectedCollections.value.length);
const isCollectionView = computed(() => Boolean(store.selectedCollectionId));
const collectionStopAction = computed(() => normalizeStopAction(store.selectedCollection?.stopAction));
const filteredCollections = computed(() => {
  const query = collectionSearchQuery.value.trim().toLowerCase();
  if (!query) return store.collections;
  return store.collections.filter((collection) => collection.name.toLowerCase().includes(query));
});
const filteredTasks = computed(() => {
  const query = taskSearchQuery.value.trim().toLowerCase();
  if (!query) return store.tasks;
  return store.tasks.filter((task) => task.name.toLowerCase().includes(query));
});
const filteredTaskCollections = computed(() => {
  const query = taskModal.search.trim().toLowerCase();
  if (!query) return store.collections;
  return store.collections.filter((collection) => collection.name.toLowerCase().includes(query));
});
const taskHistoryLogs = computed(() => store.taskRunLogs || []);
const taskLatestRunByTaskId = computed(() => {
  const map = new Map();
  for (const log of taskHistoryLogs.value) {
    if (!log || !log.taskId) continue;
    if (!map.has(log.taskId)) {
      map.set(log.taskId, log);
    }
  }
  return map;
});
const isCollectionHistoryClearDisabled = computed(() => {
  if (!collectionHistoryLogs.value.length) return true;
  return Boolean(
    activeRun.value &&
      activeRun.value.status === 'running' &&
      activeRun.value.targetType === 'collection'
  );
});
const isTaskHistoryClearDisabled = computed(() => {
  if (!taskHistoryLogs.value.length) return true;
  return taskHistoryLogs.value.some((log) => log && log.status === 'running');
});
const boardTotalNews = computed(() => boardNewsTable.value.length);
const boardAverageSentiment = computed(() => {
  if (!boardNewsTable.value.length) return '0.000';
  const sum = boardNewsTable.value.reduce((acc, item) => acc + Number(item.sentiment_score || 0), 0);
  return (sum / boardNewsTable.value.length).toFixed(3);
});
const boardExtremeSentimentCount = computed(() => {
  return boardNewsTable.value.filter((item) => item.sentiment_score >= 0.9 || item.sentiment_score <= 0.2).length;
});
const boardSentimentDistribution = computed(() => {
  const buckets = {
    positive: { key: 'positive', label: '支持 (>0.6)', color: boardTone.positive, count: 0 },
    neutral: { key: 'neutral', label: '观望 (0.4-0.6)', color: boardTone.neutral, count: 0 },
    negative: { key: 'negative', label: '争议 (<0.4)', color: boardTone.negative, count: 0 }
  };
  boardNewsTable.value.forEach((item) => {
    buckets[boardSentimentKey(item.sentiment_score)].count += 1;
  });
  return Object.values(buckets).map((item) => ({
    ...item,
    percent: boardTotalNews.value ? Math.round((item.count / boardTotalNews.value) * 100) : 0
  }));
});
const boardTrendSeries = computed(() => {
  const monthMap = new Map();
  boardNewsTable.value.forEach((item) => {
    const month = String(item.publish_date || '').slice(0, 7);
    if (!month) return;
    if (!monthMap.has(month)) {
      monthMap.set(month, { key: month, scoreSum: 0, count: 0 });
    }
    const record = monthMap.get(month);
    record.scoreSum += Number(item.sentiment_score || 0);
    record.count += 1;
  });
  return [...monthMap.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => ({
      key: item.key,
      label: item.key.slice(5).replace('-', '/'),
      avgScore: item.count ? item.scoreSum / item.count : 0,
      volume: item.count
    }));
});
const libraryTotalPages = computed(() => {
  return Math.max(1, Math.ceil(libraryTotal.value / libraryPageSize.value));
});
const boardSourceStacked = computed(() => {
  const sourceMap = new Map();
  boardNewsTable.value.forEach((item) => {
    const source = item.source || '未知来源';
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { source, positive: 0, neutral: 0, negative: 0, total: 0 });
    }
    const current = sourceMap.get(source);
    current[boardSentimentKey(item.sentiment_score)] += 1;
    current.total += 1;
  });
  return [...sourceMap.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map((row) => ({
      ...row,
      positivePct: row.total ? Number(((row.positive / row.total) * 100).toFixed(1)) : 0,
      neutralPct: row.total ? Number(((row.neutral / row.total) * 100).toFixed(1)) : 0,
      negativePct: row.total ? Number(((row.negative / row.total) * 100).toFixed(1)) : 0
    }));
});
const boardKeywordSentimentMap = computed(() => {
  const map = new Map();
  boardNewsTable.value.forEach((item) => {
    const keywords = Array.isArray(item.keywords) ? item.keywords : [];
    keywords.forEach((keyword) => {
      if (!map.has(keyword)) {
        map.set(keyword, []);
      }
      map.get(keyword).push(Number(item.sentiment_score || 0));
    });
  });
  return map;
});
const boardSentimentWordCloud = computed(() => {
  if (!boardWordFreqTable.value.length) return [];
  const maxCount = Math.max(...boardWordFreqTable.value.map((item) => item.count));
  const minCount = Math.min(...boardWordFreqTable.value.map((item) => item.count));
  return boardWordFreqTable.value.map((item, index) => {
    const sentimentList = boardKeywordSentimentMap.value.get(item.word) || [];
    const sentiment = sentimentList.length
      ? sentimentList.reduce((acc, value) => acc + value, 0) / sentimentList.length
      : 0.5;
    const band = boardSentimentKey(sentiment);
    const color = band === 'positive' ? boardTone.positive : band === 'negative' ? boardTone.negative : boardTone.neutral;
    const ratio = maxCount === minCount ? 1 : (item.count - minCount) / (maxCount - minCount);
    return {
      ...item,
      sentiment,
      color,
      size: Number((13 + ratio * 15).toFixed(2)),
      opacity: Number((0.66 + ((index % 5) * 0.08)).toFixed(2))
    };
  });
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
const displayCards = computed(() => {
  if (!store.selectedCollectionId) {
    return store.filteredCards.map((card, index) => ({ card, index }));
  }
  const collection = store.selectedCollection;
  if (!collection) return [];
  const map = new Map(store.cards.map((card) => [card.id, card]));
  let entries = collection.cardIds
    .map((id, index) => ({ card: map.get(id), index }))
    .filter((entry) => entry.card);
  if (store.searchQuery.trim()) {
    const q = store.searchQuery.trim().toLowerCase();
    entries = entries.filter(({ card }) => {
      return (
        card.name.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        card.command.toLowerCase().includes(q)
      );
    });
  }
  return entries;
});
const windowMaximized = ref(false);

function isCardRunning(cardId) {
  return (
    isRunActive.value &&
    activeRun.value &&
    activeRun.value.targetType === 'card' &&
    activeRun.value.targetId === cardId
  );
}

function isCollectionRunning(collectionId) {
  return (
    isRunActive.value &&
    activeRun.value &&
    activeRun.value.targetType === 'collection' &&
    activeRun.value.targetId === collectionId
  );
}

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

async function loadBoardData() {
  if (!window.terminalHelper || typeof window.terminalHelper.fetchBoardData !== 'function') return;
  try {
    const result = await window.terminalHelper.fetchBoardData();
    if (!result || !result.ok) return;
    boardNewsData.value = Array.isArray(result.news) ? result.news : [];
    boardWordFreqData.value = Array.isArray(result.words) ? result.words : [];
    boardDataLoaded.value = true;
  } catch (error) {
    // keep fallback mock data
  }
}

function ensureBoardChart(domRef, instance) {
  const dom = domRef.value;
  if (!dom) return instance;
  if (instance && instance.getDom() === dom) return instance;
  if (instance) {
    instance.dispose();
  }
  return echarts.init(dom, null, { renderer: 'canvas' });
}

function renderBoardCharts() {
  if (activePage.value !== 'board') return;
  boardSentimentChart = ensureBoardChart(boardSentimentChartRef, boardSentimentChart);
  boardTrendChart = ensureBoardChart(boardTrendChartRef, boardTrendChart);
  boardSourceChart = ensureBoardChart(boardSourceChartRef, boardSourceChart);
  if (!boardSentimentChart || !boardTrendChart || !boardSourceChart) return;

  const sentimentData = boardSentimentDistribution.value.map((item) => ({
    name: item.label,
    value: item.count,
    itemStyle: { color: item.color }
  }));
  boardSentimentChart.setOption(
    {
      animationDuration: 520,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(30, 41, 59, 0.92)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '42%',
          style: { text: '均值', fill: '#64748b', fontSize: 12, fontWeight: 500 }
        },
        {
          type: 'text',
          left: 'center',
          top: '52%',
          style: { text: boardAverageSentiment.value, fill: '#334155', fontSize: 18, fontWeight: 700 }
        }
      ],
      series: [
        {
          type: 'pie',
          radius: ['58%', '82%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: sentimentData
        }
      ]
    },
    true
  );

  const trendSeries = boardTrendSeries.value;
  boardTrendChart.setOption(
    {
      animationDuration: 540,
      grid: { left: 48, right: 44, top: 20, bottom: 34 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        backgroundColor: 'rgba(30, 41, 59, 0.92)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendSeries.map((item) => item.key),
        axisLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.45)' } },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 1,
          name: '情感',
          nameTextStyle: { color: '#64748b', fontSize: 11, padding: [0, 0, 0, 6] },
          splitLine: { lineStyle: { color: 'rgba(99, 102, 241, 0.14)' } },
          axisLine: { show: false },
          axisLabel: { color: '#64748b', fontSize: 11 }
        },
        {
          type: 'value',
          min: 0,
          name: '热度',
          nameTextStyle: { color: '#64748b', fontSize: 11, padding: [0, 6, 0, 0] },
          splitLine: { show: false },
          axisLine: { show: false },
          axisLabel: { color: '#64748b', fontSize: 11 }
        }
      ],
      series: [
        {
          name: '平均情感分',
          type: 'line',
          yAxisIndex: 0,
          smooth: 0.38,
          symbolSize: 6,
          data: trendSeries.map((item) => Number(item.avgScore.toFixed(3))),
          lineStyle: { width: 2.4, color: '#859900' },
          itemStyle: { color: '#859900' },
          areaStyle: { color: 'rgba(133, 153, 0, 0.2)' }
        },
        {
          name: '新闻总量',
          type: 'line',
          yAxisIndex: 1,
          smooth: 0.25,
          symbolSize: 5,
          data: trendSeries.map((item) => item.volume),
          lineStyle: { width: 2, type: 'dashed', color: '#268BD2' },
          itemStyle: { color: '#268BD2' }
        }
      ]
    },
    true
  );

  const sourceRows = boardSourceStacked.value;
  boardSourceChart.setOption(
    {
      animationDuration: 520,
      grid: { left: 96, right: 26, top: 16, bottom: 28 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => `${value}%`,
        backgroundColor: 'rgba(30, 41, 59, 0.92)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        textStyle: { color: '#e2e8f0', fontSize: 12 }
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(99, 102, 241, 0.12)' } },
        axisLabel: { color: '#64748b', fontSize: 11, formatter: '{value}%' }
      },
      yAxis: {
        type: 'category',
        data: sourceRows.map((item) => item.source),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#475569', fontSize: 11 }
      },
      series: [
        { name: '正面', type: 'bar', stack: 'total', data: sourceRows.map((item) => item.positivePct), itemStyle: { color: '#859900' } },
        { name: '中性', type: 'bar', stack: 'total', data: sourceRows.map((item) => item.neutralPct), itemStyle: { color: '#B58900' } },
        { name: '负面', type: 'bar', stack: 'total', data: sourceRows.map((item) => item.negativePct), itemStyle: { color: '#DC322F' } }
      ]
    },
    true
  );
}

function resizeBoardCharts() {
  if (boardSentimentChart) boardSentimentChart.resize();
  if (boardTrendChart) boardTrendChart.resize();
  if (boardSourceChart) boardSourceChart.resize();
}

function disposeBoardCharts() {
  if (boardSentimentChart) {
    boardSentimentChart.dispose();
    boardSentimentChart = null;
  }
  if (boardTrendChart) {
    boardTrendChart.dispose();
    boardTrendChart = null;
  }
  if (boardSourceChart) {
    boardSourceChart.dispose();
    boardSourceChart = null;
  }
}

function setTerminalContainerRef(tabId, el) {
  if (!el) {
    terminalContainerRefs.delete(tabId);
    return;
  }
  terminalContainerRefs.set(tabId, el);
}

function switchTerminalTab(tabId) {
  activeTerminalTabId.value = tabId;
}

function handleTerminalTabsWheel(event) {
  const el = event.currentTarget;
  if (!el) return;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  el.scrollLeft += delta;
}

async function closeTerminalTab(tabId) {
  if (!tabId) return;
  const index = terminalTabs.value.findIndex((tab) => tab.id === tabId);
  if (index < 0) return;
  for (const [runId, mappedTabId] of collectionRunTabByRunId.entries()) {
    if (mappedTabId === tabId) {
      collectionRunTabByRunId.delete(runId);
    }
  }
  if (pendingCollectionRunTab.value === tabId) {
    pendingCollectionRunTab.value = null;
  }
  if (pendingCardRunTab.value === tabId) {
    pendingCardRunTab.value = null;
  }
  const wasActive = activeTerminalTabId.value === tabId;
  destroyTerminalTab(tabId);
  terminalContainerRefs.delete(tabId);
  terminalTabs.value.splice(index, 1);
  if (!wasActive) return;
  const nextTab = terminalTabs.value[index] || terminalTabs.value[index - 1] || null;
  activeTerminalTabId.value = nextTab ? nextTab.id : '';
}

function getTerminalState(tabId) {
  if (!terminalStates.has(tabId)) {
    terminalStates.set(tabId, {
      instance: null,
      fitAddon: null,
      sessionId: null,
      disposers: [],
      shell: 'cmd'
    });
  }
  return terminalStates.get(tabId);
}

function shellLabel(shell) {
  if (shell === 'ps') return 'PS';
  if (shell === 'bash') return 'BASH';
  return 'CMD';
}

function findTerminalTab(tabId) {
  return terminalTabs.value.find((tab) => tab.id === tabId) || null;
}

function createCollectionTerminalTab(shell, collectionName) {
  terminalTabSeed.value += 1;
  const id = `term-${terminalTabSeed.value}`;
  const label = `${shellLabel(shell)} ${collectionName}`;
  terminalTabs.value.push({ id, label, shell: shell || 'cmd', mode: 'run' });
  return id;
}

function createCardTerminalTab(shell, cardName) {
  terminalTabSeed.value += 1;
  const id = `term-${terminalTabSeed.value}`;
  const label = `${shellLabel(shell)} ${cardName}`;
  terminalTabs.value.push({ id, label, shell: shell || 'cmd', mode: 'run' });
  return id;
}

function getTerminalTheme() {
  return {
    foreground: '#657B83',
    background: '#00000000',
    cursor: '#002B36',
    selection: '#2C4D57',
    black: '#002B36',
    red: '#DC322F',
    green: '#586E75',
    yellow: '#657B83',
    blue: '#839496',
    magenta: '#D33682',
    cyan: '#93A1A1',
    white: '#FDF6E3',
    brightBlack: '#073642',
    brightRed: '#CB4B16',
    brightGreen: '#859900',
    brightYellow: '#B58900',
    brightBlue: '#268BD2',
    brightMagenta: '#6C71C4',
    brightCyan: '#2AA198',
    brightWhite: '#EEE8D5'
  };
}

async function ensureTerminalTab(tabId, preferredShell = 'cmd', options = {}) {
  if (!tabId) return null;
  const container = terminalContainerRefs.get(tabId);
  const state = getTerminalState(tabId);
  const tab = findTerminalTab(tabId);
  const isRunTab = tab?.mode === 'run';
  const interactive = options && options.interactive === true;
  const shouldCreateSession = interactive || !isRunTab;
  const desiredShell = preferredShell || tab?.shell || 'cmd';
  if (!container || !state) return null;
  if (!state.instance) {
    state.instance = new XTerm({
      allowTransparency: true,
      convertEol: true,
      cursorBlink: true,
      disableStdin: !shouldCreateSession,
      fontSize: 18,
      fontFamily:
        '"Cascadia Mono", "Microsoft YaHei", "Segoe UI", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      theme: getTerminalTheme()
    });
    state.fitAddon = new FitAddon();
    state.instance.loadAddon(state.fitAddon);
    state.instance.open(container);
    state.instance.onData((data) => {
      if (state.sessionId) {
        window.terminalHelper.terminalWrite(state.sessionId, data);
      }
    });
    state.instance.onResize(({ cols, rows }) => {
      if (state.sessionId) {
        window.terminalHelper.terminalResize(state.sessionId, cols, rows);
      }
    });
    const offData = window.terminalHelper.onTerminalData((payload) => {
      if (payload && payload.id === state.sessionId && state.instance) {
        state.instance.write(payload.data);
      }
    });
    const offExit = window.terminalHelper.onTerminalExit((payload) => {
      if (payload && payload.id === state.sessionId && state.instance) {
        state.sessionId = null;
        state.instance.options.disableStdin = true;
        state.instance.write('\r\n[Session Ended]\r\n');
      }
    });
    state.disposers = [offData, offExit];
  }
  if (state.fitAddon) {
    state.fitAddon.fit();
  }
  if (state.instance) {
    state.instance.options.disableStdin = !shouldCreateSession;
  }
  if (state.sessionId && state.shell !== desiredShell) {
    await window.terminalHelper.terminalClose(state.sessionId);
    state.sessionId = null;
    if (state.instance && !isRunTab) {
      state.instance.write('\x1bc');
    }
  }
  if (shouldCreateSession && !state.sessionId) {
    const result = await window.terminalHelper.terminalCreate({
      cols: state.instance.cols,
      rows: state.instance.rows,
      shell: desiredShell
    });
    if (!result || !result.ok) {
      showToast('终端启动失败', 'error');
      return null;
    }
    state.sessionId = result.id;
    state.shell = desiredShell;
    if (tab) {
      tab.shell = desiredShell;
    }
    if (state.instance) {
      state.instance.options.disableStdin = false;
      state.instance.focus();
    }
  }
  if (!shouldCreateSession && state.instance) {
    state.instance.options.disableStdin = true;
  }
  return state;
}

function setTerminalInputEnabled(tabId, enabled) {
  if (!tabId) return;
  const state = terminalStates.get(tabId);
  if (!state || !state.instance) return;
  state.instance.options.disableStdin = !enabled;
  if (enabled) {
    state.instance.focus();
  }
}

function getCollectionPreferredShell(collectionId) {
  const collection = store.collections.find((c) => c.id === collectionId);
  if (!collection) return 'cmd';
  const firstCardId = collection.cardIds.find((id) => store.cards.some((card) => card.id === id));
  if (!firstCardId) return 'cmd';
  const firstCard = store.cards.find((card) => card.id === firstCardId);
  return firstCard?.shell || 'cmd';
}

function resizeTerminalTab(tabId) {
  if (!tabId) return;
  const state = getTerminalState(tabId);
  if (!state || !state.instance || !state.fitAddon) return;
  state.fitAddon.fit();
  if (state.sessionId) {
    window.terminalHelper.terminalResize(state.sessionId, state.instance.cols, state.instance.rows);
  }
}

function resizeTerminal() {
  if (activePage.value !== 'terminal') return;
  resizeTerminalTab(activeTerminalTabId.value);
}

function destroyTerminalTab(tabId) {
  const state = getTerminalState(tabId);
  if (!state) return;
  if (state.disposers.length) {
    state.disposers.forEach((dispose) => dispose && dispose());
    state.disposers = [];
  }
  if (state.sessionId) {
    window.terminalHelper.terminalClose(state.sessionId);
    state.sessionId = null;
  }
  if (state.instance) {
    state.instance.dispose();
    state.instance = null;
  }
  state.fitAddon = null;
  state.shell = 'cmd';
  terminalStates.delete(tabId);
}

function destroyTerminal() {
  collectionRunTabByRunId.clear();
  pendingCollectionRunTab.value = null;
  terminalTabs.value.forEach((tab) => destroyTerminalTab(tab.id));
}

function writeToTerminalTab(tabId, text) {
  const state = getTerminalState(tabId);
  if (!state || !state.instance || !text) return;
  state.instance.write(text.replace(/\r?\n/g, '\r\n'));
}

function writeRunOutput(runId, text) {
  const tabId = collectionRunTabByRunId.get(runId);
  if (!tabId) return;
  writeToTerminalTab(tabId, text);
}

async function clearActiveTerminalConnection() {
  const tabId = activeTerminalTabId.value;
  if (!tabId) return;
  const state = terminalStates.get(tabId);
  if (!state || !state.instance) return;
  for (const [runId, mappedTabId] of collectionRunTabByRunId.entries()) {
    if (mappedTabId === tabId) {
      collectionRunTabByRunId.delete(runId);
    }
  }
  if (state.sessionId) {
    await window.terminalHelper.terminalClose(state.sessionId);
    state.sessionId = null;
  }
  state.instance.options.disableStdin = true;
  state.instance.write('\x1bc');
  showToast('已清除连接', 'success');
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
  const qwen = store.settings?.qwen || {};
  settingsForm.cmd = paths.cmd || 'cmd.exe';
  settingsForm.ps = paths.ps || 'powershell.exe';
  settingsForm.bash = paths.bash || 'bash';
  settingsForm.qwenApiKey = typeof qwen.apiKey === 'string' ? qwen.apiKey : '';
  settingsForm.qwenBaseURL = qwen.baseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  settingsForm.qwenModel = qwen.model || 'qwen-plus';
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

function applyQwenSettings() {
  store.settings.qwen = {
    apiKey: (settingsForm.qwenApiKey || '').trim(),
    baseURL: (settingsForm.qwenBaseURL || '').trim() || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: (settingsForm.qwenModel || '').trim() || 'qwen-plus'
  };
  store.persist();
  showToast('Qwen 配置已保存', 'success');
}

function saveSettings() {
  store.settings.shellPaths = {
    cmd: settingsForm.cmd.trim() || 'cmd.exe',
    ps: settingsForm.ps.trim() || 'powershell.exe',
    bash: settingsForm.bash.trim() || 'bash'
  };
  store.settings.qwen = {
    apiKey: (settingsForm.qwenApiKey || '').trim(),
    baseURL: (settingsForm.qwenBaseURL || '').trim() || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: (settingsForm.qwenModel || '').trim() || 'qwen-plus'
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

function defaultStopAction(shell = 'cmd') {
  return {
    name: '停止',
    command: '',
    shell,
    useDedicatedTerminal: true
  };
}

function normalizeStopAction(action, fallbackShell = 'cmd') {
  const source = action && typeof action === 'object' ? action : {};
  const shell = source.shell === 'ps' || source.shell === 'bash' || source.shell === 'cmd' ? source.shell : fallbackShell;
  return {
    name: typeof source.name === 'string' && source.name.trim() ? source.name.trim() : '停止',
    command: typeof source.command === 'string' ? source.command : '',
    shell,
    useDedicatedTerminal: source.useDedicatedTerminal !== false
  };
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
      cardIds: [...collection.cardIds],
      stopAction: normalizeStopAction(collection.stopAction)
    };
  } else {
    collectionModal.mode = 'create';
    collectionModal.collectionId = null;
    collectionModal.form = {
      name: '',
      cardIds: [...selectedForCollection.value],
      stopAction: defaultStopAction()
    };
  }
  collectionModal.search = '';
  collectionModal.open = true;
}

function openStopActionEditor() {
  if (!store.selectedCollection) return;
  openCollectionModal(store.selectedCollection);
}

function saveCollection() {
  const payload = {
    name: collectionModal.form.name.trim(),
    cardIds: collectionModal.form.cardIds,
    stopAction: normalizeStopAction(collectionModal.form.stopAction)
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

function collectionName(collectionId) {
  const collection = store.collections.find((c) => c.id === collectionId);
  return collection ? collection.name : '未知集合';
}

function taskCollectionsText(task) {
  if (!task || !Array.isArray(task.collectionIds) || task.collectionIds.length === 0) {
    return '未选择集合';
  }
  return task.collectionIds.map((id) => collectionName(id)).join(' / ');
}

function makeTaskRunLogId() {
  return `taskrun_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function latestTaskRun(taskId) {
  return taskLatestRunByTaskId.value.get(taskId) || null;
}

function isTaskRunning(taskId) {
  const run = latestTaskRun(taskId);
  return Boolean(run && run.status === 'running');
}

function taskCompletedBadges(taskId) {
  const run = latestTaskRun(taskId);
  if (!run || !Array.isArray(run.history)) return [];
  const badges = [];
  run.history.forEach((item, index) => {
    if (!item) return;
    if (item.status !== 'success' && item.status !== 'skipped' && item.status !== 'failed' && item.status !== 'stopped') {
      return;
    }
    const mode = item.status === 'failed' || item.status === 'stopped' ? 'error' : 'success';
    const label = item.collectionName || `集合 ${index + 1}`;
    badges.push({
      key: `${run.id || 'run'}-${index}-${mode}`,
      index,
      mode,
      title: `${label}：${item.status}`
    });
  });
  return badges;
}

function taskRunStatus(taskId) {
  const run = latestTaskRun(taskId);
  return run?.status || 'idle';
}

function taskProgressPercent(taskId) {
  const run = latestTaskRun(taskId);
  if (!run) return 0;
  const total = Math.max(1, Number(run.totalCollections || 0));
  const completed = Math.max(0, Number(run.completedCollections || 0));
  const ratio = Math.max(0, Math.min(1, completed / total));
  return Math.round(ratio * 100);
}

function taskProgressText(taskId) {
  const run = latestTaskRun(taskId);
  if (!run) return '未运行';
  const completed = Number(run.completedCollections || 0);
  const total = Number(run.totalCollections || 0);
  if (run.status === 'running') {
    const current = run.currentCollectionName ? ` · 当前：${run.currentCollectionName}` : '';
    return `进行中 ${completed}/${total}${current}`;
  }
  return `最近一次：${run.status} (${completed}/${total})`;
}

function taskProgressTone(taskId) {
  const run = latestTaskRun(taskId);
  if (!run) return 'text-slate-400';
  if (run.status === 'running') return 'text-indigo-600';
  if (run.status === 'success') return 'text-emerald-600';
  if (run.status === 'failed' || run.status === 'stopped') return 'text-rose-600';
  return 'text-slate-500';
}

function taskHistoryTone(status) {
  if (status === 'running') return 'text-indigo-600';
  if (status === 'success') return 'text-emerald-600';
  if (status === 'failed' || status === 'stopped') return 'text-rose-600';
  return 'text-slate-500';
}

function addCardToCollectionDraft(cardId) {
  collectionModal.form.cardIds.push(cardId);
}

function removeSelectedCard(index) {
  collectionModal.form.cardIds.splice(index, 1);
}

function addCollectionToTaskDraft(collectionId) {
  taskModal.form.collectionIds.push(collectionId);
}

function removeSelectedCollection(index) {
  taskModal.form.collectionIds.splice(index, 1);
}

function openTaskModal(task) {
  if (task) {
    taskModal.mode = 'edit';
    taskModal.taskId = task.id;
    taskModal.form = {
      name: task.name,
      collectionIds: [...task.collectionIds]
    };
  } else {
    taskModal.mode = 'create';
    taskModal.taskId = null;
    taskModal.form = {
      name: '',
      collectionIds: []
    };
  }
  taskModal.search = '';
  taskModal.open = true;
}

function saveTask() {
  const payload = {
    name: taskModal.form.name.trim(),
    collectionIds: taskModal.form.collectionIds
  };
  if (!payload.name) {
    showToast('请输入任务名称', 'error');
    return;
  }
  if (payload.collectionIds.length === 0) {
    showToast('请至少选择一个集合', 'error');
    return;
  }
  if (taskModal.mode === 'edit') {
    store.updateTask(taskModal.taskId, payload);
  } else {
    store.addTask(payload);
  }
  taskModal.open = false;
  showToast('任务已保存', 'success');
}

function selectionKey(cardId, index) {
  return isCollectionView.value ? `i:${index}` : `c:${cardId}`;
}

function isCardSelected(cardId, index) {
  return selectedForCollection.value.includes(selectionKey(cardId, index));
}

function toggleSelectForCollection(cardId, index) {
  const key = selectionKey(cardId, index);
  const idx = selectedForCollection.value.indexOf(key);
  if (idx >= 0) {
    selectedForCollection.value.splice(idx, 1);
  } else {
    selectedForCollection.value.push(key);
  }
}

function confirmDeleteSelectedCards() {
  if (!selectedForCollection.value.length) return;
  if (store.selectedCollectionId) {
    const indices = selectedForCollection.value
      .filter((k) => k.startsWith('i:'))
      .map((k) => Number.parseInt(k.slice(2), 10))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => b - a);
    const names = indices.map((idx) => cardName(store.selectedCollection.cardIds[idx]));
    confirmModal.title = '移出集合';
    confirmModal.message = `确认从当前集合移出选中的 ${indices.length} 张卡片吗？`;
    confirmModal.details = names.join('\n');
    confirmModal.confirmText = '确认移出';
    confirmModal.onConfirm = () => {
      indices.forEach((idx) => store.removeCardFromCollectionAt(store.selectedCollectionId, idx));
      selectedForCollection.value = [];
      confirmModal.open = false;
    };
    confirmModal.open = true;
    return;
  }
  const targets = selectedForCollection.value
    .filter((k) => k.startsWith('c:'))
    .map((k) => k.slice(2));
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

function editCollectionOrder(index) {
  const collection = store.selectedCollection;
  if (!collection) return;
  const current = index + 1;
  editingOrderId.value = index;
  orderInputValue.value = String(current);
  nextTick(() => {
    const el = orderInputRefs.get(index);
    if (el) {
      el.focus();
      el.select();
    }
  });
}

function commitCollectionOrder(index) {
  const collection = store.selectedCollection;
  if (!collection) return;
  if (editingOrderId.value !== index) return;
  const total = collection.cardIds.length;
  const next = Number.parseInt(orderInputValue.value, 10);
  if (!Number.isFinite(next) || next < 1 || next > total) {
    showToast('请输入有效序号', 'error');
    return;
  }
  editingOrderId.value = null;
  store.reorderCollectionCardAt(collection.id, index, next - 1);
}

function cancelCollectionOrder() {
  editingOrderId.value = null;
}

function setOrderInputRef(index, el) {
  if (!el) {
    orderInputRefs.delete(index);
  } else {
    orderInputRefs.set(index, el);
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

function confirmDeleteCard(card, index) {
  const collectionId = store.selectedCollectionId;
  if (collectionId) {
    confirmModal.title = '移出集合';
    confirmModal.message = `确认从当前集合移出卡片「${card.name}」吗？`;
    confirmModal.details = card.command;
    confirmModal.confirmText = '确认移出';
    confirmModal.onConfirm = () => {
      if (Number.isInteger(index)) {
        store.removeCardFromCollectionAt(collectionId, index);
      } else {
        store.removeCardFromCollection(collectionId, card.id);
      }
      confirmModal.open = false;
    };
    confirmModal.open = true;
    return;
  }
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

function confirmDeleteTask(task) {
  confirmModal.title = '删除任务';
  confirmModal.message = `确认删除任务「${task.name}」吗？`;
  confirmModal.details = task.collectionIds.map((id) => collectionName(id)).join('\n') || '未选择集合';
  confirmModal.confirmText = '确认删除';
  confirmModal.onConfirm = () => {
    store.deleteTask(task.id);
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
    const preferredShell = card.shell || 'cmd';
    const tabId = createCardTerminalTab(preferredShell, card.name);
    activeTerminalTabId.value = tabId;
    activePage.value = 'terminal';
    await nextTick();
    const state = await ensureTerminalTab(tabId, preferredShell);
    if (!state) return;
    pendingCardRunTab.value = tabId;
    await window.terminalHelper.runCard(toPlain(card));
  };
  confirmModal.open = true;
}

async function stopActiveRun() {
  if (!activeRun.value || activeRun.value.status !== 'running') return;
  let options = undefined;
  if (activeRun.value.targetType === 'collection') {
    const targetCollection = store.collections.find((c) => c.id === activeRun.value.targetId);
    options = { stopAction: normalizeStopAction(targetCollection?.stopAction) };
  }
  await window.terminalHelper.stopRun(activeRun.value.id, options);
}

function clearCollectionHistoryLogs() {
  if (isCollectionHistoryClearDisabled.value) return;
  const total = collectionHistoryLogs.value.length;
  const collectionId = store.selectedCollectionId || null;
  if (collectionId) {
    store.clearCollectionRunLogs(collectionId);
  } else {
    store.clearAllRunLogs();
  }
  showToast(`已清理 ${total} 条集合历史`, 'success');
}

function clearTaskHistoryLogs() {
  if (isTaskHistoryClearDisabled.value) return;
  const total = taskHistoryLogs.value.length;
  store.clearTaskRunLogs();
  showToast(`已清理 ${total} 条任务历史`, 'success');
}

function runCollection(collection) {
  const cards = collection.cardIds.map((id) => store.cards.find((c) => c.id === id)).filter(Boolean);
  if (!cards.length) {
    showToast('集合没有可执行卡片', 'error');
    return;
  }
  confirmModal.title = '运行集合';
  confirmModal.message = `即将在终端中展示并运行集合「${collection.name}」`;
  confirmModal.details = cards.map((c) => c.command).join('\n');
  confirmModal.confirmText = '确认执行';
  confirmModal.onConfirm = async () => {
    confirmModal.open = false;
    const preferredShell = cards[0]?.shell || 'cmd';
    const tabId = createCollectionTerminalTab(preferredShell, collection.name);
    activeTerminalTabId.value = tabId;
    activePage.value = 'terminal';
    await nextTick();
    const state = await ensureTerminalTab(tabId, preferredShell);
    if (!state) return;
    pendingCollectionRunTab.value = tabId;
    window.terminalHelper.runCollection(toPlain(collection), cards.map(toPlain));
  };
  confirmModal.open = true;
}

function runTask(task) {
  const collectionIds = task.collectionIds.filter((id) => store.collections.some((c) => c.id === id));
  if (!collectionIds.length) {
    showToast('任务没有可执行集合', 'error');
    return;
  }
  confirmModal.title = '运行任务';
  confirmModal.message = `即将串行运行任务「${task.name}」`;
  confirmModal.details = collectionIds.map((id, index) => `${index + 1}. ${collectionName(id)}`).join('\n');
  confirmModal.confirmText = '确认执行';
  confirmModal.onConfirm = async () => {
    confirmModal.open = false;
    const taskRunId = makeTaskRunLogId();
    const startedAt = new Date().toISOString();
    store.addTaskRunLog({
      id: taskRunId,
      taskId: task.id,
      taskName: task.name,
      status: 'running',
      startedAt,
      endedAt: null,
      totalCollections: collectionIds.length,
      completedCollections: 0,
      currentCollectionId: null,
      currentCollectionName: '',
      history: collectionIds.map((id) => ({
        collectionId: id,
        collectionName: collectionName(id),
        status: 'pending',
        startedAt: null,
        endedAt: null
      }))
    });
    let finalStatus = 'success';
    let completed = 0;
    for (const collectionId of collectionIds) {
      const collection = store.collections.find((c) => c.id === collectionId);
      if (!collection) continue;
      const startedAtStep = new Date().toISOString();
      const currentHistory = (store.taskRunLogs.find((log) => log.id === taskRunId)?.history || []).map((item) => {
        if (item.collectionId !== collectionId) return item;
        return { ...item, status: 'running', startedAt: startedAtStep };
      });
      store.updateTaskRunLog(taskRunId, {
        currentCollectionId: collectionId,
        currentCollectionName: collection.name,
        history: currentHistory
      });
      const cards = collection.cardIds.map((id) => store.cards.find((c) => c.id === id)).filter(Boolean);
      if (!cards.length) {
        showToast(`集合「${collection.name}」没有可执行卡片，已跳过`, 'error');
        completed += 1;
        const history = (store.taskRunLogs.find((log) => log.id === taskRunId)?.history || []).map((item) => {
          if (item.collectionId !== collectionId) return item;
          return { ...item, status: 'skipped', endedAt: new Date().toISOString() };
        });
        store.updateTaskRunLog(taskRunId, { completedCollections: completed, history });
        continue;
      }
      const preferredShell = cards[0]?.shell || 'cmd';
      const tabId = createCollectionTerminalTab(preferredShell, collection.name);
      activeTerminalTabId.value = tabId;
      activePage.value = 'terminal';
      await nextTick();
      const state = await ensureTerminalTab(tabId, preferredShell);
      if (!state) {
        finalStatus = 'failed';
        const history = (store.taskRunLogs.find((log) => log.id === taskRunId)?.history || []).map((item) => {
          if (item.collectionId !== collectionId) return item;
          return { ...item, status: 'failed', endedAt: new Date().toISOString() };
        });
        store.updateTaskRunLog(taskRunId, { history });
        break;
      }
      pendingCollectionRunTab.value = tabId;
      const result = await window.terminalHelper.runCollection(toPlain(collection), cards.map(toPlain));
      if (result && result.error) {
        finalStatus = 'failed';
        const history = (store.taskRunLogs.find((log) => log.id === taskRunId)?.history || []).map((item) => {
          if (item.collectionId !== collectionId) return item;
          return { ...item, status: 'failed', endedAt: new Date().toISOString() };
        });
        store.updateTaskRunLog(taskRunId, {
          currentCollectionId: collectionId,
          currentCollectionName: collection.name,
          completedCollections: completed,
          history
        });
        showToast(`任务中断：${result.error}`, 'error');
        break;
      }
      const collectionStatus = result?.status || 'failed';
      if (collectionStatus === 'success' || collectionStatus === 'skipped') {
        completed += 1;
      }
      const history = (store.taskRunLogs.find((log) => log.id === taskRunId)?.history || []).map((item) => {
        if (item.collectionId !== collectionId) return item;
        return { ...item, status: collectionStatus, endedAt: new Date().toISOString() };
      });
      store.updateTaskRunLog(taskRunId, {
        completedCollections: completed,
        currentCollectionId: collectionId,
        currentCollectionName: collection.name,
        history
      });
      if (collectionStatus === 'failed' || collectionStatus === 'stopped') {
        finalStatus = collectionStatus;
        showToast(`任务在「${collection.name}」结束：${collectionStatus}`, 'error');
        break;
      }
    }
    store.updateTaskRunLog(taskRunId, {
      status: finalStatus,
      endedAt: new Date().toISOString(),
      currentCollectionId: null,
      currentCollectionName: ''
    });
    if (finalStatus === 'success') {
      showToast(`任务「${task.name}」执行完成`, 'success');
    }
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

function handleDuplicateCard(card, index) {
  const collectionId = store.selectedCollectionId;
  const newId = store.duplicateCard(card);
  if (!collectionId) return;
  const collection = store.collections.find((c) => c.id === collectionId);
  if (!collection) return;
  const insertIndex = Number.isInteger(index) ? index + 1 : collection.cardIds.length;
  store.insertCardIntoCollection(collectionId, newId, insertIndex);
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
  await loadBoardData();
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
      if (value === 'board') {
        nextTick(() => {
          renderBoardCharts();
          resizeBoardCharts();
        });
      }
      if (value === 'library') {
        libraryPage.value = 1;
        expandedLibraryId.value = null;
        loadLibraryPage();
      }
      if (value === 'settings') {
        syncSettingsForm();
      }
      if (value === 'tasks') {
        taskDoneAnimSeed.value += 1;
      }
      if (value === 'terminal') {
        const tabId = activeTerminalTabId.value;
        if (tabId) {
          nextTick(() => {
            const shell = findTerminalTab(tabId)?.shell || 'cmd';
            ensureTerminalTab(tabId, shell);
            resizeTerminalTab(tabId);
          });
        }
      }
      fabAnimKey.value += 1;
    }
  );
  watch(
    () => libraryQuery.value,
    () => {
      if (activePage.value !== 'library') return;
      if (librarySearchTimer.value) {
        clearTimeout(librarySearchTimer.value);
      }
      librarySearchTimer.value = setTimeout(() => {
        libraryPage.value = 1;
        loadLibraryPage();
      }, 350);
    }
  );
  watch(
    [boardSentimentDistribution, boardTrendSeries, boardSourceStacked],
    () => {
      if (activePage.value !== 'board') return;
      nextTick(() => {
        renderBoardCharts();
      });
    },
    { deep: true }
  );
  watch(
    () => activeTerminalTabId.value,
    (value) => {
      if (!value) return;
      if (activePage.value !== 'terminal') return;
      nextTick(() => {
        const shell = findTerminalTab(value)?.shell || 'cmd';
        ensureTerminalTab(value, shell);
        resizeTerminalTab(value);
      });
    }
  );
  window.addEventListener('resize', resizeTerminal);
  window.addEventListener('resize', resizeBoardCharts);
  nextTick(() => {
    renderBoardCharts();
  });
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
    if (payload.targetType === 'collection') {
      const tabId = pendingCollectionRunTab.value || activeTerminalTabId.value;
      collectionRunTabByRunId.set(payload.runId, tabId);
      pendingCollectionRunTab.value = null;
      setTerminalInputEnabled(tabId, false);
      writeRunOutput(payload.runId, `\r\n=== 开始运行集合：${targetName} ===\r\n`);
    }
    if (payload.targetType === 'card') {
      const tabId = pendingCardRunTab.value || activeTerminalTabId.value;
      collectionRunTabByRunId.set(payload.runId, tabId);
      pendingCardRunTab.value = null;
      setTerminalInputEnabled(tabId, false);
      writeRunOutput(payload.runId, `\r\n=== 开始运行卡片：${targetName} ===\r\n`);
    }
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
    writeRunOutput(payload.runId, `\r\n$ ${payload.command}\r\n`);
  });
  window.terminalHelper.onRunLog((payload) => {
    store.appendRunOutput(payload.runId, payload.stepId, payload.stream, payload.chunk);
    writeRunOutput(payload.runId, payload.chunk || '');
  });
  window.terminalHelper.onRunStepEnd((payload) => {
    store.updateRunStep(payload.runId, payload.stepId, {
      status: payload.status,
      exitCode: payload.exitCode,
      endedAt: payload.endedAt
    });
    const suffix = payload.status === 'success' ? 'OK' : payload.status === 'stopped' ? 'STOPPED' : 'FAILED';
    writeRunOutput(payload.runId, `\r\n[${suffix}] exit=${payload.exitCode}\r\n`);
  });
  window.terminalHelper.onRunEnd(async (payload) => {
    const runLog = store.runLogs.find((r) => r.id === payload.runId) || null;
    store.updateRun(payload.runId, {
      status: payload.status,
      endedAt: payload.endedAt
    });
    if (runLog && runLog.targetType === 'collection') {
      writeRunOutput(payload.runId, `\r\n=== 集合结束：${payload.status} ===\r\n`);
    } else if (runLog && runLog.targetType === 'card') {
      writeRunOutput(payload.runId, `\r\n=== 卡片结束：${payload.status} ===\r\n`);
    }
    const tabId = collectionRunTabByRunId.get(payload.runId);
    if (runLog && runLog.targetType === 'collection' && tabId) {
      const shell = getCollectionPreferredShell(runLog.targetId);
      const state = await ensureTerminalTab(tabId, shell, { interactive: true });
      if (state && state.instance) {
        state.instance.write('\r\n');
        setTerminalInputEnabled(tabId, true);
      }
    }
    collectionRunTabByRunId.delete(payload.runId);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeTerminal);
  window.removeEventListener('resize', resizeBoardCharts);
  disposeBoardCharts();
  destroyTerminal();
});
</script>


