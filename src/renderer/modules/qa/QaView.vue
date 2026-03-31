<template>
  <div class="qa-display">
    <p v-if="!qaCaveLines.length" class="qa-line qa-line-empty">暂无内容</p>
    <p v-for="(line, index) in qaCaveLines" :key="`qa-line-${index}`" class="qa-line">
      {{ line }}
    </p>
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
defineProps({
  qaCaveLines: { type: Array, default: () => [] },
  qaInput: { type: String, default: '' },
  qaLoading: { type: Boolean, default: false },
  onInput: { type: Function, required: true },
  onSend: { type: Function, required: true }
});
</script>
