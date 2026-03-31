<template>
  <section class="library-panel flex-1 min-h-0">
    <div class="library-panel-head">
      <div>
        <h3 class="text-sm font-semibold text-slate-700">新闻资料库</h3>
      </div>
      <div class="library-search">
        <input
          :value="libraryQuery"
          class="library-search-input"
          placeholder="搜索标题 / 来源 / 摘要 / 关键词"
          @input="onQueryChange($event.target.value)"
        />
      </div>
    </div>
    <div class="library-list flex-1 min-h-0">
      <div v-if="libraryLoading" class="library-empty">加载中...</div>
      <div v-else-if="!libraryItems.length" class="library-empty">暂无匹配新闻</div>
      <div v-else class="library-rows">
        <article
          v-for="item in libraryItems"
          :key="item.id"
          class="library-row"
          :class="expandedLibraryId === item.id ? 'library-row-expanded' : ''"
          @click="onToggleExpand(item.id)"
        >
          <div class="library-row-head">
            <h4 class="library-title" :title="item.title">{{ item.title || '未命名标题' }}</h4>
            <span class="library-date">{{ item.publish_date || '未知日期' }}</span>
          </div>
          <div class="library-meta">
            <span>{{ item.source || '未知来源' }}</span>
            <span>情感 {{ item.sentiment_score.toFixed(3) }}</span>
          </div>
          <p class="library-summary" v-if="expandedLibraryId !== item.id">
            {{ item.content_summary || '暂无摘要' }}
          </p>
          <p class="library-summary-full" v-else>
            {{ item.content_summary || '暂无摘要' }}
          </p>
          <div class="library-tags" v-if="item.keywords && item.keywords.length">
            <span v-for="(tag, idx) in item.keywords" :key="`${item.id}-${idx}`" class="library-tag">
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </div>
    <div class="library-footer">
      <div class="library-count">共 {{ libraryTotal }} 条</div>
      <div class="library-pager">
        <button class="icon-btn" :disabled="libraryPage <= 1" @click="onPageChange(libraryPage - 1)" title="上一页">
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <span class="library-page">第 {{ libraryPage }} / {{ libraryTotalPages }} 页</span>
        <button class="icon-btn" :disabled="libraryPage >= libraryTotalPages" @click="onPageChange(libraryPage + 1)" title="下一页">
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const ChevronLeftIcon = ChevronLeft;
const ChevronRightIcon = ChevronRight;

defineProps({
  libraryQuery: { type: String, default: '' },
  libraryLoading: { type: Boolean, default: false },
  libraryItems: { type: Array, default: () => [] },
  libraryTotal: { type: Number, default: 0 },
  libraryPage: { type: Number, default: 1 },
  libraryTotalPages: { type: Number, default: 1 },
  expandedLibraryId: { type: [Number, String, null], default: null },
  onQueryChange: { type: Function, required: true },
  onToggleExpand: { type: Function, required: true },
  onPageChange: { type: Function, required: true }
});
</script>
