<template>
  <div class="rounded-xl p-4 space-y-4 flex-1 overflow-hidden min-h-0 flex flex-col">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-semibold text-slate-700">任务列表</h3>
        <p class="text-xs text-slate-400">创建任务并串行运行所选集合</p>
      </div>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 search-shell">
      <input
        :value="taskSearchQuery"
        class="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
        placeholder="搜索任务名称"
        @input="onTaskSearch($event.target.value)"
      />
    </div>
    <div class="space-y-2 overflow-auto pr-1 min-h-0 flex-1 scroll-fade pt-2 pb-24">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-row rounded-lg px-3 py-2"
        :class="`task-row-status-${taskRunStatus(task.id)}`"
      >
        <div v-if="latestTaskRun(task.id)" class="task-row-progress" :style="{ width: `${taskProgressPercent(task.id)}%` }"></div>
        <div class="task-row-content flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-700 truncate">{{ task.name }}</p>
            <p class="text-xs text-slate-400 truncate">{{ task.collectionIds.length }} 个集合 · {{ taskCollectionsText(task) }}</p>
            <p class="text-xs mt-0.5" :class="taskProgressTone(task.id)">{{ taskProgressText(task.id) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="icon-btn icon-btn-primary"
              :class="isRunActive || isTaskRunning(task.id) ? 'opacity-40 pointer-events-none' : ''"
              @click="runTask(task)"
              title="运行任务"
            >
              <PlayIcon class="h-4 w-4" />
            </button>
            <button class="icon-btn" @click="openTaskModal(task)" title="编辑">
              <PencilIcon class="h-4 w-4" />
            </button>
            <button class="icon-btn" @click="store.duplicateTask(task)" title="复制">
              <CopyIcon class="h-4 w-4" />
            </button>
            <button class="icon-btn icon-btn-danger" @click="confirmDeleteTask(task)" title="删除">
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div v-if="taskCompletedBadges(task.id).length" class="task-complete-badges">
          <div
            v-for="badge in taskCompletedBadges(task.id)"
            :key="`task-badge-${task.id}-${badge.key}-${taskDoneAnimSeed}`"
            class="task-complete-badge-item"
            :class="badge.mode === 'error' ? 'task-complete-badge-item-error' : ''"
            :title="badge.title"
            :style="{ animationDelay: `${badge.index * 60}ms` }"
          >
            <CheckIcon v-if="badge.mode === 'success'" class="h-4 w-4" />
            <CloseIcon v-else class="h-4 w-4" />
          </div>
        </div>
      </div>
      <div v-if="filteredTasks.length === 0" class="text-sm text-slate-400 py-6 text-center">
        还没有任务，点击“新建任务”开始。
      </div>
    </div>
    <section
      class="card-panel rounded-xl transition-all overflow-hidden fixed right-6 bottom-6 w-[360px] max-w-full max-h-[70vh] z-20"
      :class="taskHistoryCollapsed ? 'p-3' : 'p-4 space-y-4'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <button class="icon-btn" @click="onToggleTaskHistoryCollapsed" title="折叠/展开">
            <ChevronDownIcon class="h-4 w-4 transition-transform" :class="taskHistoryCollapsed ? '-rotate-90' : ''" />
          </button>
          <h2 class="text-sm font-semibold text-slate-700">任务历史记录</h2>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="icon-btn"
            :class="isTaskHistoryClearDisabled ? 'opacity-40 pointer-events-none' : ''"
            @click="clearTaskHistoryLogs"
            title="清理历史"
          >
            <BroomIcon class="h-4 w-4" />
          </button>
          <span class="text-xs text-slate-500">{{ taskHistoryLogs.length }} 条</span>
        </div>
      </div>
      <div v-if="!taskHistoryCollapsed" class="space-y-3">
        <div class="log-box rounded-lg p-3 max-h-[320px] overflow-auto space-y-3">
          <template v-if="taskHistoryLogs.length">
            <div
              v-for="log in taskHistoryLogs"
              :key="log.id"
              class="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 space-y-1"
            >
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium text-slate-700 truncate">{{ log.taskName }}</p>
                <span class="text-xs" :class="taskHistoryTone(log.status)">{{ log.status }}</span>
              </div>
              <p class="text-[11px] text-slate-500">
                开始：{{ formatDate(log.startedAt) }}
              </p>
              <p class="text-[11px] text-slate-500">
                结束：{{ log.endedAt ? formatDate(log.endedAt) : '运行中' }} · 耗时：{{ formatDuration(log.startedAt, log.endedAt) }}
              </p>
              <p class="text-[11px] text-slate-500">
                进度 {{ log.completedCollections || 0 }}/{{ log.totalCollections || 0 }}
              </p>
            </div>
          </template>
          <p v-else class="text-[11px] text-slate-500">暂无任务历史记录</p>
        </div>
      </div>
    </section>
  </div>
  <div class="fab-group" :key="`fab-tasks-${activePage}-${fabAnimKey}`">
    <button class="fab fab-bounce" @click="openTaskModal()" title="新建任务">
      <TasksIcon class="h-5 w-5" />
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
  Check,
  X,
  BrushCleaning,
  ListTodo
} from 'lucide-vue-next';

const PlayIcon = Play;
const PencilIcon = Pencil;
const CopyIcon = Copy;
const TrashIcon = Trash2;
const ChevronDownIcon = ChevronDown;
const CheckIcon = Check;
const CloseIcon = X;
const BroomIcon = BrushCleaning;
const TasksIcon = ListTodo;

defineProps({
  store: { type: Object, required: true },
  taskSearchQuery: { type: String, default: '' },
  onTaskSearch: { type: Function, required: true },
  filteredTasks: { type: Array, default: () => [] },
  taskRunStatus: { type: Function, required: true },
  latestTaskRun: { type: Function, required: true },
  taskProgressPercent: { type: Function, required: true },
  taskProgressTone: { type: Function, required: true },
  taskProgressText: { type: Function, required: true },
  taskCollectionsText: { type: Function, required: true },
  isRunActive: { type: Boolean, default: false },
  isTaskRunning: { type: Function, required: true },
  runTask: { type: Function, required: true },
  openTaskModal: { type: Function, required: true },
  confirmDeleteTask: { type: Function, required: true },
  taskCompletedBadges: { type: Function, required: true },
  taskDoneAnimSeed: { type: [Number, String], default: 0 },
  taskHistoryCollapsed: { type: Boolean, default: false },
  onToggleTaskHistoryCollapsed: { type: Function, required: true },
  isTaskHistoryClearDisabled: { type: Boolean, default: true },
  clearTaskHistoryLogs: { type: Function, required: true },
  taskHistoryLogs: { type: Array, default: () => [] },
  taskHistoryTone: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  formatDuration: { type: Function, required: true },
  fabAnimKey: { type: [Number, String], default: 0 },
  activePage: { type: String, default: '' }
});
</script>
