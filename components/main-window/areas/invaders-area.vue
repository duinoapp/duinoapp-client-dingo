<script setup lang="ts">
import TSInvaders from '@mrfrase3/ts-invaders';

const projects = useProjects();
const game = shallowRef<TSInvaders | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvas.value) {
    game.value = new TSInvaders(canvas.value, {
      title: 'Invaders',
      getHighScore: () => {
        return projects.settings?.invadersHighScore || 0;
      },
      setHighScore: (score: number) => {
        projects.updateSettings({ invadersHighScore: score });
      },
    });
    game.value.start();
  }
});

onUnmounted(() => {
  game.value?.destroy();
});

</script>

<template>
  <div class="invaders-area d-flex align-center justify-center">
    <canvas ref="canvas" width="640" height="640" />
  </div>
</template>

<style scoped lang="scss">
.invaders-area {
  background-color: var(--v-background-color);
  height: 100%;
  width: 100%;

  canvas {
    max-height: 680px;
    height: 100%;
    
    image-rendering: optimizeSpeed;
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast
  }
}
</style>
    