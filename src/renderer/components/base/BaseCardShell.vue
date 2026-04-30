<template>
  <component :is="tag" :class="cardClass">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tag: { type: String, default: 'article' },
  shell: { type: String, default: '' },
  extraClass: { type: [String, Array, Object], default: '' }
});

const cardClass = computed(() => [
  'card-panel card-fixed rounded-xl p-4 flex flex-col gap-3 w-[90%] justify-self-start relative',
  props.shell ? `card-shell-${props.shell}` : '',
  props.extraClass
]);
</script>
