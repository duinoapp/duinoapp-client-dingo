<script setup lang="ts">

withDefaults(defineProps<{
  board?: Board,
}>(), {
  board: undefined,
});

const boards = useBoards();
const { isBoardSelected, setBoard } = boards;

const dialog = ref(false);

</script>

<template>
  <btn-primary
    v-if="board && !isBoardSelected(board)"
    prepend-icon="mdi-plus"
    size="small"
    @click="setBoard(board)"
  >
    Select
  </btn-primary>
  <v-dialog
    v-else-if="board"
    v-model="dialog"
    max-width="400px"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        size="small"
        variant="tonal"
        prepend-icon="mdi-cog"
      >
        Settings
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <v-icon size="small" start>mdi-cog</v-icon>
        Board Settings
      </v-card-title>
      <v-card-text>
        <v-row v-if="board.config_options?.length" class="board-opts">
          <v-col
            v-for="config in board.config_options"
            :key="config.option"
            cols="12"
          >
            <boards-option :board="board" :config="config" />
          </v-col>
        </v-row>
        <p v-else class="text-caption">No settings available for this board, you're good to go!</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>  
</template>

<style lang="scss" scoped>
.board-opts {
  max-height: 400px;
  overflow-y: auto;
}
</style>