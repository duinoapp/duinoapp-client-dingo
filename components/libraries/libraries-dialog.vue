<script setup lang="ts">

const props = withDefaults(defineProps<{
  library?: Library,
}>(), {
  library: undefined,
});

const dialog = ref(false);
const tab = ref('info');

const normName = (name: string) => name.replace(/<[^>]+>/g, '').trim();

const authors = computed(() => props.library?.author.split(';'));
const maintainers = computed(() => props.library?.maintainer.split(';')
  .filter((maintainer) => !authors.value?.some((name) => normName(name) === normName(maintainer))));

// split list of architectures into two halves
const archParts = computed(() => {
  const archs = props.library?.architectures?.map((arch) => arch === '*' ? 'All' : arch);
  if (!archs) return [];
  const half = Math.ceil(archs.length / 2);
  return [archs.slice(0, half), archs.slice(half)];
});

</script>

<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="flat"
        icon="mdi-information-slab-circle-outline"
        size="x-small"
        class="mr-2"
      />
    </template>
    <v-card v-if="library">
      <v-card-title>{{ library.name }}</v-card-title>
      <v-tabs v-model="tab" density="compact" color="primary">
        <v-tab value="info">Info</v-tab>
        <v-tab value="examples">Examples</v-tab>
      </v-tabs>
      <v-card-text class="pt-0 main">
        <v-window v-model="tab">
          <v-window-item value="info">
            <p class="desc mt-2">
              {{ library.sentence }} {{ library.paragraph }}
            </p>
            <v-divider />
            <div v-if="library.architectures?.length" class="text-h6">Architectures:</div>
            <div v-for="(part, index) in archParts" :key="index" class="arches">
              <ul>
                <li v-for="arch in part" :key="arch">{{ arch }}</li>
              </ul>
            </div>
            <div v-if="library.dependencies?.length" class="text-h6">Dependencies:</div>
            <ul>
              <li v-for="dep in library.dependencies" :key="dep.name">{{ dep.name }}</li>
            </ul>
            <v-divider />
            <div v-if="authors?.length" class="text-h6">Authors:</div>
            <ul>
              <li v-for="author in authors" :key="author">{{ author }}</li>
            </ul>
            <div v-if="maintainers?.length" class="text-h6">Maintainers:</div>
            <ul>
              <li v-for="maintainer in maintainers" :key="maintainer">{{ maintainer }}</li>
            </ul>
          </v-window-item>
          <v-window-item value="examples">
            <libraries-examples :library="library" @close="dialog = false" />
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="tonal"
          target="_blank"
          prepend-icon="mdi-link"
          size="small"
          :href="library.website"
        >
          Website
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          size="small"
          class="mr-2"
          @click="dialog = false"
        >
          Close
        </v-btn>
        <libraries-add :library="library" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
ul {
  margin-left: 1em;
}

.v-divider {
  margin: 0.75em 0;
}

.arches {
  display: inline-block;
  width: 50%;
}

.desc {
  font-size: 0.875rem;
}

.main {
  max-height: 500px;
  overflow-y: auto;
}
</style>
