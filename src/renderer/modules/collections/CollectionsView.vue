<template>
  <div class="rounded-xl p-4 space-y-4 flex-1 overflow-hidden min-h-0 flex flex-col">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-semibold text-slate-700">集合列表</h3>
        <p class="text-xs text-slate-400">管理集合与卡片排序</p>
      </div>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 search-shell">
      <input
        :value="collectionSearchQuery"
        class="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
        placeholder="搜索集合名称"
        @input="onCollectionSearch($event.target.value)"
      />
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
</template>

<script setup>
import {
  Pencil,
  Copy,
  Trash2,
  Circle,
  CheckCircle2,
  FolderPlus,
  Import,
  Upload
} from 'lucide-vue-next';

const PencilIcon = Pencil;
const CopyIcon = Copy;
const TrashIcon = Trash2;
const CircleIcon = Circle;
const CheckCircleIcon = CheckCircle2;
const FolderPlusIcon = FolderPlus;
const ImportIcon = Import;
const ExportIcon = Upload;

defineProps({
  store: { type: Object, required: true },
  collectionSearchQuery: { type: String, default: '' },
  onCollectionSearch: { type: Function, required: true },
  filteredCollections: { type: Array, default: () => [] },
  toggleCollectionSelection: { type: Function, required: true },
  selectedCollections: { type: Array, default: () => [] },
  openCollectionModal: { type: Function, required: true },
  confirmDeleteCollection: { type: Function, required: true },
  selectedCount: { type: Number, default: 0 },
  selectedCollectionCount: { type: Number, default: 0 },
  confirmDeleteSelectedCollections: { type: Function, required: true },
  importData: { type: Function, required: true },
  exportData: { type: Function, required: true },
  fabAnimKey: { type: [Number, String], default: 0 },
  activePage: { type: String, default: '' }
});
</script>
