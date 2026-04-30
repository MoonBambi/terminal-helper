<template>
  <button
    :type="type"
    :class="buttonClass"
    :title="title"
    :aria-label="resolvedAriaLabel"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tone: { type: String, default: 'default' },
  title: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  extraClass: { type: [String, Array, Object], default: '' }
});

const emit = defineEmits(['click']);

const toneClassMap = {
  default: '',
  primary: 'icon-btn-primary',
  danger: 'icon-btn-danger',
  check: 'icon-btn-check'
};

const buttonClass = computed(() => {
  const toneClass = toneClassMap[props.tone] || '';
  return ['icon-btn', toneClass, props.selected ? 'icon-btn-selected' : '', props.extraClass];
});

const resolvedAriaLabel = computed(() => props.ariaLabel || props.title || null);

function onClick(event) {
  if (props.disabled) return;
  emit('click', event);
}
</script>
