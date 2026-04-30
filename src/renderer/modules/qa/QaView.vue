<template>
  <div class="qa-display">
    <p v-if="!qaQuestion && !qaDecision.conclusion" class="qa-line qa-line-empty">暂无内容</p>
    <div class="qa-decision-grid">
      <BaseCardShell tag="article" shell="ps" extra-class="qa-decision-card qa-card-question">
        <h4 class="qa-decision-title">你的问题</h4>
        <p class="qa-decision-body">{{ qaQuestion || '尚未提问' }}</p>
      </BaseCardShell>
      <BaseCardShell tag="article" shell="ps" extra-class="qa-decision-card qa-card-conclusion">
        <h4 class="qa-decision-title">结论</h4>
        <p class="qa-decision-body">{{ qaDecision.conclusion || '暂无结论' }}</p>
      </BaseCardShell>
      <BaseCardShell tag="article" shell="ps" extra-class="qa-decision-card qa-card-evidence">
        <h4 class="qa-decision-title">证据</h4>
        <p class="qa-decision-body">{{ qaDecision.evidence || '暂无证据' }}</p>
      </BaseCardShell>
      <BaseCardShell tag="article" shell="ps" extra-class="qa-decision-card qa-card-action">
        <h4 class="qa-decision-title">建议动作</h4>
        <p class="qa-decision-body">{{ qaDecision.action || '暂无建议动作' }}</p>
      </BaseCardShell>
      <BaseCardShell tag="article" shell="ps" extra-class="qa-decision-card qa-card-risk">
        <h4 class="qa-decision-title">风险等级</h4>
        <p class="qa-decision-body">{{ qaDecision.risk || '未评估' }}</p>
      </BaseCardShell>
      <BaseCardShell tag="article" shell="ps" extra-class="qa-decision-card qa-card-confidence">
        <h4 class="qa-decision-title">置信度</h4>
        <p class="qa-decision-body">{{ qaDecision.confidence || '未评估' }}</p>
      </BaseCardShell>
    </div>
    <div class="qa-trace-card">
      <p v-if="qaTimeRange && qaTimeRange !== '结果未包含时间字段（可能为全量范围）'" class="qa-trace-line">
        <span class="qa-trace-key">数据时间范围：</span>
        <span class="qa-trace-value">{{ qaTimeRange }}</span>
      </p>
      <p class="qa-trace-line">
        <span class="qa-trace-key">可追溯SQL：</span>
      </p>
      <pre class="qa-trace-sql">{{ qaTraceSql || '本次未返回SQL（可能命中无数据兜底回答）' }}</pre>
    </div>
  </div>
  <div class="qa-chat-shell">
    <textarea
      :value="qaInput"
      class="qa-chat-input"
      placeholder="输入内容..."
      rows="3"
      @input="onInput($event.target.value)"
      @keydown.enter.exact.prevent="onSend"
    />
    <button class="qa-chat-send" type="button" :disabled="qaLoading" @click="onSend">
      {{ qaLoading ? '发送中' : '发送' }}
    </button>
  </div>
</template>

<script setup>
import BaseCardShell from '../../components/base/BaseCardShell.vue';

defineProps({
  qaCaveLines: { type: Array, default: () => [] },
  qaQuestion: { type: String, default: '' },
  qaDecision: {
    type: Object,
    default: () => ({
      conclusion: '',
      evidence: '',
      action: '',
      risk: '',
      confidence: ''
    })
  },
  qaTraceSql: { type: String, default: '' },
  qaTimeRange: { type: String, default: '' },
  qaInput: { type: String, default: '' },
  qaLoading: { type: Boolean, default: false },
  onInput: { type: Function, required: true },
  onSend: { type: Function, required: true }
});
</script>
