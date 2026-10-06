<script setup>
defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="field">
    <span>
      {{ label }}
      <b v-if="required">*</b>
    </span>
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :required="required"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>
