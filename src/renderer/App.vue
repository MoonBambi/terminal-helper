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
            :class="activePage === 'cards' && !store.selectedCollectionId ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'cards'; store.selectedCollectionId = null"
          >
            <AllCardsIcon class="h-4 w-4" />
            全部卡片
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'collections' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'collections'"
          >
            <CollectionsIcon class="h-4 w-4" />
            集合管理
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'tasks' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'tasks'"
          >
            <TasksIcon class="h-4 w-4" />
            任务
          </button>
          <button
            class="w-full text-left px-3 py-2 rounded-md flex items-center gap-2"
            :class="activePage === 'terminal' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'"
            @click="activePage = 'terminal'"
          >
            <TerminalIcon class="h-4 w-4" />
            终端
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

      <div class="flex flex-col h-full min-h-0" :class="activePage === 'terminal' ? 'terminal-shell' : ''">
        <div
          class="flex-1 overflow-hidden min-h-0 main-divider"
          :class="activePage === 'terminal' ? 'px-0 py-0 terminal-outer' : 'px-6 py-4'"
        >
          <main v-if="activePage === 'cards'" class="relative h-full flex flex-col min-h-0">
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
                      v-model="orderInputValue"
                      class="order-badge-input"
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
                  <button class="icon-btn" @click="logCollapsed = !logCollapsed" title="折叠/展开">
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
          </main>
          <main v-else-if="activePage === 'collections'" class="space-y-4 h-full flex flex-col min-h-0">
            <div class="rounded-xl p-4 space-y-4 flex-1 overflow-hidden min-h-0 flex flex-col">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-slate-700">集合列表</h3>
                  <p class="text-xs text-slate-400">管理集合与卡片排序</p>
                </div>
              </div>
              <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 search-shell">
                <input v-model="collectionSearchQuery" class="w-full bg-transparent text-sm text-slate-700 focus:outline-none" placeholder="搜索集合名称" />
              </div>
              <div class="space-y-2 overflow-auto pr-1 min-h-0 flex-1 scroll-fade pt-2 pb-24">
                <div
                  v-for="collection in filteredCollections"
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
                <div v-if="filteredCollections.length === 0" class="text-sm text-slate-400 py-6 text-center">
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
              <button class="fab fab-bounce" @click="importData" title="导入 JSON">
                <ImportIcon class="h-5 w-5" />
              </button>
              <button class="fab fab-alt fab-bounce" @click="exportData" title="导出 JSON">
                <ExportIcon class="h-5 w-5" />
              </button>
            </div>
          </main>
          <main v-else-if="activePage === 'tasks'" class="space-y-4 h-full flex flex-col min-h-0">
            <div class="rounded-xl p-4 space-y-4 flex-1 overflow-hidden min-h-0 flex flex-col">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-slate-700">任务列表</h3>
                  <p class="text-xs text-slate-400">创建任务并串行运行所选集合</p>
                </div>
              </div>
              <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 search-shell">
                <input v-model="taskSearchQuery" class="w-full bg-transparent text-sm text-slate-700 focus:outline-none" placeholder="搜索任务名称" />
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
                    <button class="icon-btn" @click="taskHistoryCollapsed = !taskHistoryCollapsed" title="折叠/展开">
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
          </main>
          <main v-show="activePage === 'terminal'" class="space-y-4 h-full flex flex-col min-h-0 terminal-panel pt-8 pl-8 pr-4 pb-4">
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
          </main>
          <main v-if="activePage === 'settings'" class="space-y-4 h-full flex flex-col min-h-0">
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
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
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
  CheckCircle2,
  Terminal,
  BrushCleaning,
  LayoutGrid,
  FolderKanban,
  ListTodo
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
const TerminalIcon = Terminal;
const BroomIcon = BrushCleaning;
const AllCardsIcon = LayoutGrid;
const CollectionsIcon = FolderKanban;
const TasksIcon = ListTodo;

const store = useDataStore();
const activePage = ref('cards');
const logoAnimSeed = ref(0);
const fabAnimKey = ref(0);
const logCollapsed = ref(false);
const settingsForm = reactive({ cmd: 'cmd.exe', ps: 'powershell.exe', bash: 'bash' });
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

function playLogoAnimation() {
  logoAnimSeed.value += 1;
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
  const logs = store.runLogs.filter((run) => run.targetType === 'collection');
  if (!selectedCollectionId) return logs;
  return logs.filter((run) => run.targetId === selectedCollectionId);
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
  store.clearCollectionRunLogs(collectionId);
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
    writeRunOutput(payload.runId, `\r\n=== 集合结束：${payload.status} ===\r\n`);
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
  destroyTerminal();
});
</script>


