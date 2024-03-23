<script setup lang="ts">

const { showInvalidDialog, hideInvalidDialog } = useServers();
const { panelState } = usePanels();

const addServer = () => {
  panelState.leftPanelType = 'servers';
  hideInvalidDialog();
};

</script>

<template>
  <v-dialog
    :model-value="showInvalidDialog()"
    max-width="400px"
    @update:model-value="hideInvalidDialog"
  >
    <v-card>
      <v-card-title>
        <v-icon color="error">mdi-alert-circle</v-icon>
        Compile Server Not Found
      </v-card-title>
      <v-card-text>
        <p>
          The current compile server is not reachable.
          You must select a new server before you can continue.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="hideInvalidDialog">Close</v-btn>
        <btn-primary @click="addServer">Manage Servers</btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>