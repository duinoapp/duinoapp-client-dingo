<script lang="ts" setup>
import { CircuitHero, type CircuitHeroProps } from '@mrfrase3/circuit-hero';

const mounted = ref(false);
const canvas = ref<HTMLCanvasElement | null>(null);
const circuitHero = shallowRef<CircuitHero | null>(null);
const { width, height } = useWindowSize();

const heroProps = computed<CircuitHeroProps>(() => ({
  width: width.value,
  height: height.value,
}));

const wrapperClass = computed(() => ({
  'hero-landing d-flex': true,
  'hero-landing-mounted': mounted.value,
}));

onMounted(() => {
  if (canvas.value) {
    circuitHero.value = new CircuitHero(canvas.value, heroProps.value);
  }
  mounted.value = true;
});

onUnmounted(() => {
  circuitHero.value?.stop();
});

watch([width, height, canvas], () => {
  circuitHero.value?.stop();
  circuitHero.value = new CircuitHero(canvas.value!, heroProps.value);
});

</script>

<template>
  <div :class="wrapperClass">
    <client-only>
      <canvas ref="canvas" :width="width" :height="height" class="background-canvas" />
    </client-only>
    <v-scroll-x-transition name="fade" mode="out-in" appear>
      <v-container class="hero-landing-content">
        <v-row align="start" justify="space-between">
          <v-col cols="12" md="4" lg="6" xl="8" order="2">
            <h1 class="text-h1 ml-n2">DuinoApp</h1>
            <p class="text-subtitle-1">Build your projects anywhere</p>
            <br>
            <btn-primary class="my-6" to="/code" nuxt>
              Start Coding
            </btn-primary>
            <v-alert class="d-lg-none" type="info">
              Please note that DuinoApp is not yet available for mobile/tablet devices.
            </v-alert>
          </v-col>
          <v-col cols="12" md="8" lg="6" xl="4" order="1" order-md="3" class="text-center">
            <v-img src="/neon-main.svg" width="572" inline />
          </v-col>
        </v-row>
        <div class="scroll-indicator">
          <v-icon
            icon="mdi-chevron-down"
            size="48"
            class="bob-animation"
          />
        </div>
      </v-container>
    </v-scroll-x-transition>
  </div>
  <v-divider />
</template>

<style scoped lang="scss">

.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}

.hero-landing {
  height: 100vh;
  position: relative;
  z-index: 1;
  
  &.hero-landing-mounted {
    margin-top: -64px;
    transition: margin-top 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hero-landing-content {
    padding-top: max(15vh, 64px);
    pointer-events: none;

    .v-btn {
      pointer-events: auto;
    }

    .text-subtitle-1 {
      display: inline-block;
      background-color: rgba(18,18,18, 0.7);
      border-radius: 4px;
      margin-left: -8px;
      padding: 0 8px;
    }
  }

  .scroll-indicator {
    position: absolute;
    bottom: 48px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;

    @supports (animation-timeline: scroll()) {
      animation: fade-out linear;
      animation-timeline: scroll();
      animation-range: 0% 30%;
      animation-fill-mode: forwards;
    }

    .bob-animation {
      animation: bob 3s ease-in-out infinite;
    }
  }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

</style>
