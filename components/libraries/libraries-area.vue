<script setup lang="ts">
import { searchHighlight } from '@/utils/search';

const {
  searchLibs,
  isLoadingLibs,
} = useLibraries();

const search = ref('');
const page = ref(1);
const itemsPerPage = ref(25);

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Author', value: 'author' },
  { title: 'Category', value: 'category' },
  { title: 'Version', value: 'version' },
];

const searchRes = computed(() => searchLibs(search.value, page.value - 1, itemsPerPage.value));

const normName = (name: string) => name
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

watch(search, (to, from) => {
  if (to === from) return;
  page.value = 1;
});

</script>

<template>
  <div class="lib-area pa-3">
    <div>
      <v-text-field
        v-model="search"
        label="Search libraries"
        density="compact"
        variant="outlined"
        hide-details="auto"
        autocomplete="off"
        clearable
        @click:clear="search = ''"
      />
    </div>
    <v-divider class="my-2" />
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :headers="headers"
      :items="searchRes.data"
      :items-length="searchRes.total"
      :loading="isLoadingLibs()"
      :search="search"
      item-value="name"
      style="height: calc(100% - 57px);"
    >
      <template #item.name="{ item }">
        <span v-html="searchHighlight(item.name, search)" />
      </template>
      <template #item.author="{ item }">
        {{ normName(item.author) }}
      </template>
      <template #item.version="{ item }">
        <div class="d-flex align-center">
          <libraries-dialog :library="item" />
          <libraries-add :library="item" />
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<style scoped lang="scss">
.lib-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
</style>