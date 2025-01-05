<script setup lang="ts">

const props = withDefaults(defineProps<{
  board?: Board,
  config?: BoardConfigOption,
}>(), {
  board: undefined,
  config: undefined,
});

const boards = useBoards();
const { setBoardOption } = boards;

const items = computed(() => {
  if (!props.board || !props.config) return [];
  return props.config.values.map((v) => ({
    title: v.value_label || v.value,
    value: v.value,
  }));
});

</script>

<template>
  <v-select
    v-if="board && config"
    :model-value="boards.boardData.options[config.option]"
    :items="items"
    :label="config.option_label"
    density="compact"
    variant="outlined"
    hide-details="auto"
    @update:model-value="setBoardOption(config.option, $event)"
  />
</template>
