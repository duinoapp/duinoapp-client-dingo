<script setup lang="ts">
import { Panel, PanelGroup, PanelResizeHandle } from 'vue-resizable-panels';

const isLeftPanelCollapsed = ref(false);
const isBottomPanelCollapsed = ref(false);

</script>

<template>
  <PanelGroup class="main-grid-hgroup" direction="horizontal">
    <Panel
      class="main-grid-left"
      :default-size="15"
      :min-size="10"
      collapsible
      @collapse="isLeftPanelCollapsed = $event"
    >
      <slot name="left">
        <div>left</div>
      </slot>
    </Panel>
    <PanelResizeHandle
      :class="{ 'main-grid-left-handle': true, collapsed: isLeftPanelCollapsed }"
    >
      <div class="handle-v-accent" />
    </PanelResizeHandle>
    <Panel
      :min-size="30"
      class="main-grid-right"
    >
      <PanelGroup class="main-grid-vgroup" direction="vertical">
        <Panel :min-size="10" class="main-grid-top">
          <slot name="top">
            <div>top</div>
          </slot>
        </Panel>
        <PanelResizeHandle
          :class="{ 'main-grid-bottom-handle': true, collapsed: isBottomPanelCollapsed }"
        >
          <div class="handle-h-accent" />
        </PanelResizeHandle>
        <Panel
          :default-size="20"
          :min-size="5"
          class="main-grid-bottom"
          collapsible
          @collapse="isBottomPanelCollapsed = $event"
        >
          <slot name="bottom">
            <div>bottom</div>
          </slot>
        </Panel>
      </PanelGroup>
    </Panel>
  </PanelGroup>
</template>

<style scoped lang="scss">
.main-grid-hgroup {
  height: 100%;
  width: 100%;
}

.main-grid-left-handle {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: relative;

  &:hover {
    border-right: 1.5px solid rgba(var(--v-theme-primary), 1);
    border-left: 1.5px solid rgba(var(--v-theme-primary), 1);
  }

  .handle-v-accent {
    display: none;
  }

  &.collapsed {
    .handle-v-accent {
      display: block;
      position: relative;
      height: 30%;
      top: 35%;
      width: 1px;
      margin-left: 2px;
      margin-right: 2px;
      background-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }
    &:hover .handle-v-accent {
      background-color: rgba(var(--v-theme-primary), 1);
      width: 2px;
    }
  }

}

.main-grid-vgroup {
  height: 100%;
  width: 100%;
}

.main-grid-bottom-handle {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: relative;

  &:hover {
    border-bottom: 1.5px solid rgba(var(--v-theme-primary), 1);
    border-top: 1.5px solid rgba(var(--v-theme-primary), 1);
  }

  .handle-h-accent {
    display: none;
  }

  &.collapsed {
    .handle-h-accent {
      display: block;
      position: relative;
      width: 30%;
      left: 35%;
      height: 1px;
      margin-top: 2px;
      margin-bottom: 2px;
      background-color: rgba(var(--v-border-color), var(--v-border-opacity));
    }
    &:hover .handle-h-accent {
      background-color: rgba(var(--v-theme-primary), 1);
      height: 2px;
    }
  }
}

</style>
