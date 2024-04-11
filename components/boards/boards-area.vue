<script setup lang="ts">
import { searchHighlight } from '@/utils/search';

const boards = useBoards();
const { searchBoards } = boards;

const search = ref('');
const page = ref(1);
const itemsPerPage = ref(25);
const platform = ref(null as string | null);

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Platform', value: 'platform.name' },
  { title: 'Actions', value: 'actions' },
];

const searchRes = computed(() => searchBoards(search.value, page.value - 1, itemsPerPage.value, platform.value ?? undefined));

watch(search, (to, from) => {
  if (to === from) return;
  page.value = 1;
});

watch(platform, (to, from) => {
  if (to === from) return;
  page.value = 1;
});

</script>

<template>
  <div class="boards-area pa-3">
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          label="Search boards"
          density="compact"
          variant="solo"
          hide-details="auto"
          autocomplete="off"
          clearable
          @click:clear="search = ''"
        />
      </v-col>
      <v-col cols="4">
        <v-select
          v-model="platform"
          :items="boards.platforms"
          label="Platform"
          density="compact"
          variant="solo"
          hide-details="auto"
          clearable
        />
      </v-col>
    </v-row>
    <v-divider class="my-2" />
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :headers="headers"
      :items="searchRes.data"
      :items-length="searchRes.total"
      :loading="boards.loadingBoards"
      :search="search"
      item-value="name"
      style="height: calc(100% - 57px);"
    >
      <template #item.name="{ item }">
        <span v-html="searchHighlight(item.name, search)" />
      </template>
      <template #item.actions="{ item }">
        <boards-actions :board="item" />
      </template>
    </v-data-table-server>
  </div>
</template>

<style scoped lang="scss">
.boards-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
</style>