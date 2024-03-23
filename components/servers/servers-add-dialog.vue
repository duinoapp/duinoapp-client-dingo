<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import { required, url, helpers } from '@vuelidate/validators';
const { servers, setServerUrl, getServerInfo } = useServers();

const state = reactive({
  url: '',
});

const serverInfo = ref<ServerInfo | null>(null);
const loading = ref(false);
const dialog = ref(false);
const urlExists = computed(() => servers.some((server) => server.url === state.url));
const hint = computed(() => {
  if (!serverInfo.value) return '';
  return `✅ Found server: ${serverInfo.value.name}`;
});

const hasInfo = async (value: string) => {
  serverInfo.value = null;
  try {
    serverInfo.value = await getServerInfo(value);
    return !!serverInfo.value;
  } catch (e) {
    return false;
  }
};

const rules = {
  url: {
    required: helpers.withMessage('Server URL is required', required),
    url: helpers.withMessage('Invalid URL', url),
    exists: helpers.withMessage('Server URL already added', () => !urlExists.value),
    hasInfo: helpers.withMessage('Server URL is not reachable', helpers.withAsync(hasInfo)),
    $autoDirty: true,
    $lazy: true,
  },
};

const v$ = useVuelidate(rules, state);

const addServer = async () => {
  loading.value = true;
  if(!(await v$.value.$validate())) {
    loading.value = false;
    return;
  }
  if (!serverInfo.value) {
    loading.value = false;
    return;
  }
  await setServerUrl(serverInfo.value.url);
  dialog.value = false;
  loading.value = false;
};

</script>

<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template #activator="{ props }">
      <btn-primary v-bind="props" block prepend-icon="mdi-plus">
        Add Server
      </btn-primary>
    </template>
    <v-card>
      <v-card-title class="headline">Add Server</v-card-title>
      <v-card-text>
        <p class="mb-3">
          Enter the URL of the server you want to add, e.g. https://compile.example.com
        </p>
        <v-form @submit.prevent="addServer">
          <v-text-field
            v-model="state.url"
            :error-messages="v$.url.$errors.map((e) => `${e.$message}`)"
            :hint="hint"
            label="Server URL"
            variant="solo-filled"
            autofocus
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
        <btn-primary :loading="loading" @click="addServer">Add</btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>