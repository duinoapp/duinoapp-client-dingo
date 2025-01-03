<script setup lang="ts">
import { fileDefs } from '../code/code-utils';

const props = defineProps<{
  label: string;
}>();

const modelValue = defineModel<string>();

const items = computed(() => {
  const items = fileDefs.filter((fileDef) => fileDef.isSelectable).map((fileDef) => ({
    title: `.${fileDef.exts[0]} (${fileDef.title})`,
    value: fileDef.exts[0],
  }));

  if (modelValue.value && !items.some((item) => item.value === modelValue.value)) {
    items.unshift({
      title: `.${modelValue.value}`,
      value: modelValue.value,
    });
  }

  return items;
});

</script>

<template>
  <v-select
    v-model="modelValue"
    :items="items"
    :label="label"
  >
    <template #selection="{ item }">
      {{ item.title.replace(/\s.+/, '') }}
    </template>
  </v-select>
</template>

