<script setup lang="ts">

withDefaults(defineProps<{
  library?: Library,
}>(), {
  library: undefined,
});

const {
  isLibSelected,
  toggleLibrary,
  getCurrentVersion,
} = useLibraries();

</script>

<template>
  <div class="d-flex" v-if="library">
    <v-menu offset-y max-height="250px">
      <template #activator="{ props }">
        <btn-primary
          v-bind="props"
          size="small"
        >
          <v-icon start>mdi-{{ isLibSelected(library) ? 'check' : 'plus' }}</v-icon>
          {{ isLibSelected(library) ? getCurrentVersion(library) : 'Add' }}
          <v-icon>mdi-menu-down</v-icon>
        </btn-primary>
      </template>
      <v-list density="compact">
        <v-list-item
          v-for="url in library.urls"
          :key="url.url"
          @click="toggleLibrary(library, url.version)"
        >
          <v-list-item-title>
            {{ url.version }}
            <v-icon size="small" v-if="isLibSelected(library, url.version)" class="ml-1">mdi-check</v-icon>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-btn
      v-if="isLibSelected(library)"
      variant="flat"
      color="error"
      size="small"
      class="ml-1"
      @click="toggleLibrary(library)"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </div>
</template>
