<script setup lang="ts">

const { panelState } = usePanels();

const initialisedAreas = ref([panelState.leftPanelType]);

watch(panelState, () => {
  if (!initialisedAreas.value.includes(panelState.leftPanelType)) {
    initialisedAreas.value.push(panelState.leftPanelType);
  }
});

</script>

<template>
  <div class="left-window">
    <directory-area
      v-if="initialisedAreas.includes('explore')"
      v-show="panelState.leftPanelType === 'explore'"
    />
    <search-area
      v-if="initialisedAreas.includes('search')"
      v-show="panelState.leftPanelType === 'search'"
    />
    <servers-area
      v-if="initialisedAreas.includes('servers')"
      v-show="panelState.leftPanelType === 'servers'"
    />
    <projects-area
      v-if="initialisedAreas.includes('projects')"
      v-show="panelState.leftPanelType === 'projects'"
    />
    <examples-area
      v-if="initialisedAreas.includes('examples')"
      v-show="panelState.leftPanelType === 'examples'"
    />
  </div>
</template>