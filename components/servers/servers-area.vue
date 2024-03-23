<script setup lang="ts">
const { servers, getServerUrl, isLoadingServers, loadServers } = useServers();

const getRegion = (server: ServerInfo) => {
  if (!server.location || server.location === 'Unknown') return server.country;
  return `${server.country} - ${server.location}`;
};

</script>

<template>
  <div class="servers-area">
    <div class="pa-3 pb-0">
      <servers-add-dialog />
    </div>
    <v-progress-linear
      :style="{ opacity: isLoadingServers() ? 1 : 0 }"
      indeterminate
      color="primary"
    />
    <v-list class="transparent">
      <v-list-item
        v-for="server in servers"
        :key="server.url"
        :active="server.url === getServerUrl()"
        @click="server.use()"
      >
        <v-list-item-title>
          {{ server.name }}
        </v-list-item-title>
        <v-list-item-subtitle style="word-break: break-all;">
          <span class="mr-1">
            {{ server.countryEmoji }}
          </span>
          {{ server.url }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          {{ server.description }}
        </v-list-item-subtitle>
        <v-tooltip activator="parent" location="right">
          <div style="max-width: 300px;">
            <strong>{{ server.name }}</strong>
            <div class="text-caption">{{ server.url }} ({{ getRegion(server) }})</div>
            <div class="text-caption">{{ server.description }}</div>
          </div>
        </v-tooltip>
        <template #append v-if="!server.isDefault">
          <v-btn
            icon="mdi-trash-can-outline"
            variant="tonal"
            @click.stop="server.remove()"
            size="x-small"
          />
        </template>
      </v-list-item>
    </v-list>
    <div class="pa-3 text-center" v-if="!servers.length && !isLoadingServers()">
      No servers found.
      <div class="text-caption my-1">
        Could not reach any of the saved servers.
        <br>
        This could be due to a network issue with your internet connection.
      </div>
      <btn-primary size="small" prepend-icon="mdi-refresh" @click="loadServers">
        Retry
      </btn-primary>
    </div>
  </div>
</template>
