<template>
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
    <div class="pt-2 border-t border-slate-200/80 space-y-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-700">Qwen 问答配置</h3>
        <p class="text-xs text-slate-400">保存后无需每次手动设置环境变量</p>
      </div>
      <div class="space-y-1">
        <label class="text-xs text-slate-500">API Key</label>
        <div class="flex items-center gap-2">
          <input v-model="settingsForm.qwenApiKey" class="input" type="password" placeholder="sk-..." />
          <button class="icon-btn icon-btn-check" title="保存 Qwen 配置" @click="applyQwenSettings">
            <CheckIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-xs text-slate-500">Base URL</label>
        <input v-model="settingsForm.qwenBaseURL" class="input" placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-slate-500">Model</label>
        <input v-model="settingsForm.qwenModel" class="input" placeholder="qwen-plus" />
      </div>
    </div>
    <div class="flex justify-end"></div>
  </div>
</template>

<script setup>
import { Check } from 'lucide-vue-next';

const CheckIcon = Check;

defineProps({
  settingsForm: { type: Object, required: true },
  applyShell: { type: Function, required: true },
  applyQwenSettings: { type: Function, required: true }
});
</script>
