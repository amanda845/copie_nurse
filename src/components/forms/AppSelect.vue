<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Sélectionner...' },
  icon: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const focused = ref(-1)
const selectRef = ref(null)

const normalizedOptions = computed(() =>
  props.options.map((option) =>
    typeof option === 'object'
      ? option
      : { value: option, label: option },
  ),
)

const selected = computed(() =>
  normalizedOptions.value.find((option) => option.value === props.modelValue)
  || normalizedOptions.value[0],
)

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  focused.value = -1
}

function close() {
  isOpen.value = false
  focused.value = -1
}

function select(option) {
  emit('update:modelValue', option.value)
  close()
}

function handleClickOutside(event) {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    close()
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div
    ref="selectRef"
    class="field custom-select"
    :class="{ 'is-open': isOpen }"
    @keydown.escape="close"
  >
    <span>{{ label }}</span>
    <button
      type="button"
      class="custom-select-trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="custom-select-value">
        <AppIcon
          v-if="selected?.icon || icon"
          :name="selected?.icon || icon"
          :size="16"
        />
        <span :class="{ 'custom-select-placeholder': !selected }">
          {{ selected?.label || placeholder }}
        </span>
      </span>
      <AppIcon
        v-if="!disabled"
        name="chevron"
        :size="16"
        class="custom-select-chevron"
        :class="{ open: isOpen }"
      />
    </button>

    <Transition name="fade-scale">
      <div v-if="isOpen" class="custom-select-menu">
        <button
          v-for="(option, index) in normalizedOptions"
          :key="option.value"
          type="button"
          class="custom-select-option"
          :class="{
            selected: selected?.value === option.value,
            focused: focused === index,
          }"
          @click="select(option)"
          @mouseenter="focused = index"
          @mouseleave="focused = -1"
        >
          <AppIcon v-if="option.icon" :name="option.icon" :size="16" />
          <span>{{ option.label }}</span>
          <AppIcon
            v-if="selected?.value === option.value"
            name="check"
            :size="16"
            class="custom-select-check"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-select {
  position: relative;
}

.custom-select-trigger {
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid #dce3ec;
  border-radius: 10px;
  background: var(--input);
  color: var(--foreground);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  transition: border-color .2s ease, background-color .2s ease, box-shadow .2s ease;
}

.custom-select-trigger:hover,
.custom-select-trigger:focus-visible {
  border-color: var(--ring);
  background: var(--input-background);
  outline: none;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, .1);
}

.custom-select-trigger:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.custom-select-value {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.custom-select-value > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-select-placeholder {
  color: var(--muted);
}

.custom-select-chevron {
  flex: none;
  color: var(--muted);
  transition: transform .2s ease, color .2s ease;
}

.custom-select-chevron.open {
  transform: rotate(90deg);
  color: var(--ring);
}

.custom-select-menu {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 8px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--popover);
  box-shadow: 0 8px 32px var(--shadow-neutral);
}

.custom-select-option {
  width: 100%;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--foreground);
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  font-size: 11px;
  transition: background-color .15s ease, color .15s ease;
}

.custom-select-option > span {
  flex: 1;
}

.custom-select-option.focused {
  background: var(--muted-bg);
}

.custom-select-option.selected {
  background: rgba(2, 132, 199, .1);
  color: var(--ring);
  font-weight: 600;
}

.custom-select-check {
  color: var(--ring);
}

.fade-scale-enter-active {
  transition: opacity .18s ease, transform .18s ease;
}

.fade-scale-leave-active {
  transition: opacity .12s ease, transform .12s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.96);
}
</style>
