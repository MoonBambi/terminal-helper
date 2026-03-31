<template>
  <div class="board-shell space-y-4 pb-6">
    <section class="card-panel rounded-xl p-4 board-header">
      <h3 class="text-sm font-semibold text-slate-700">土地流转舆情看板</h3>
      <p class="text-xs text-slate-500 mt-1">基于新闻表与词频表的样式化分析视图（先行展示）</p>
    </section>

    <section class="grid grid-cols-12 gap-4">
      <article class="card-panel rounded-xl p-4 col-span-4 board-card board-card-glass">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-slate-700">舆情“晴雨表”</h4>
          <span class="text-[11px] text-slate-500">{{ boardTotalNews }} 条</span>
        </div>
        <div :ref="setBoardSentimentChartRef" class="mt-3 board-chart-host board-chart-host-sm"></div>
        <div class="space-y-2 flex-1 min-w-0 mt-2">
          <div v-for="item in boardSentimentDistribution" :key="item.key" class="flex items-center justify-between text-xs gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="board-legend-dot" :style="{ background: item.color }"></span>
              <span class="text-slate-600 truncate">{{ item.label }}</span>
            </div>
            <span class="text-slate-500">{{ item.count }} / {{ item.percent }}%</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4">
          <div class="board-kpi">
            <p class="text-[11px] text-slate-500">平均情感得分</p>
            <p class="text-lg font-semibold text-slate-700">{{ boardAverageSentiment }}</p>
          </div>
          <div class="board-kpi">
            <p class="text-[11px] text-slate-500">极端情绪预警</p>
            <p class="text-lg font-semibold text-slate-700">{{ boardExtremeSentimentCount }}</p>
          </div>
        </div>
      </article>

      <article class="card-panel rounded-xl p-4 col-span-8 board-card board-card-glass">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-slate-700">情感走势“心跳图”</h4>
          <span class="text-[11px] text-slate-500">按月聚合</span>
        </div>
        <div :ref="setBoardTrendChartRef" class="mt-3 board-chart-host board-chart-host-lg"></div>
        <div class="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
          <span class="inline-flex items-center gap-1"><i class="board-dot board-dot-green"></i> 平均情感分</span>
          <span class="inline-flex items-center gap-1"><i class="board-dot board-dot-blue"></i> 新闻总量</span>
        </div>
      </article>

      <article class="card-panel rounded-xl p-4 col-span-6 board-card board-card-glass board-fixed-panel">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-slate-700">媒体“偏好阵地”</h4>
          <span class="text-[11px] text-slate-500">来源对比</span>
        </div>
        <div :ref="setBoardSourceChartRef" class="mt-3 board-chart-host board-chart-host-md"></div>
        <div class="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
          <span class="inline-flex items-center gap-1"><i class="board-dot board-dot-green"></i> 正面</span>
          <span class="inline-flex items-center gap-1"><i class="board-dot board-dot-yellow"></i> 中性</span>
          <span class="inline-flex items-center gap-1"><i class="board-dot board-dot-red"></i> 负面</span>
        </div>
      </article>

      <article class="card-panel rounded-xl p-4 col-span-6 board-card board-card-cloud board-fixed-panel board-cloud-panel">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-semibold text-slate-700">高频词“情绪色彩”</h4>
          <span class="text-[11px] text-slate-500">关键词与情感联动</span>
        </div>
        <div class="mt-3 board-cloud board-cloud-scroll">
          <span
            v-for="word in boardSentimentWordCloud"
            :key="word.word"
            class="board-cloud-word"
            :style="{ fontSize: `${word.size}px`, color: word.color, opacity: word.opacity }"
            :title="`${word.word} · ${word.count} 次 · ${word.sentiment.toFixed(3)}`"
          >
            {{ word.word }}
          </span>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
defineProps({
  boardSentimentDistribution: { type: Array, default: () => [] },
  boardTotalNews: { type: [Number, String], default: 0 },
  boardAverageSentiment: { type: String, default: '0.000' },
  boardExtremeSentimentCount: { type: Number, default: 0 },
  boardSentimentWordCloud: { type: Array, default: () => [] },
  setBoardSentimentChartRef: { type: Function, required: true },
  setBoardTrendChartRef: { type: Function, required: true },
  setBoardSourceChartRef: { type: Function, required: true }
});
</script>
