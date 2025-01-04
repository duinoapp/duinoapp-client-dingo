<script lang="ts" setup>
import { useTemplateRef } from 'vue';

const props = withDefaults(defineProps<{
  uri?: string | null,
  type?: 'image' | 'video' | 'audio',
}>(), {
  uri: null,
  type: 'image',
});

const editorModels = useEditorModels();

const dataUri = ref<string | null>(null);
const showBop = ref(false);
const audioRef = useTemplateRef<HTMLAudioElement>('audio');

const loadData = () => {
  if (!props.uri) return false;
  const buffer = editorModels.getModelRawBuffer(props.uri);
  if (!buffer) return false;
  const blob = new Blob([buffer], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  if (dataUri.value && dataUri.value !== url) {
    URL.revokeObjectURL(dataUri.value);
  }
  dataUri.value = url;
  return true;
};

watch(() => props.uri, () => {
  if (!props.uri) return;
  showBop.value = false;
  if (!loadData()) {
    setTimeout(() => {
      loadData();
    }, 100);
  }
}, { immediate: true });

const bopTimeout = useTimeoutFn(() => {
  showBop.value = true;
}, 1000, { immediate: false });

// only show bop a few seconds after the audio starts
watch(() => audioRef.value, () => {
  showBop.value = false;
  if (!audioRef.value) return;
  audioRef.value.addEventListener('play', () => {
    bopTimeout.start();
  });
  audioRef.value.addEventListener('pause', () => {
    showBop.value = false;
    bopTimeout.stop();
  });
}, { immediate: true });

onBeforeUnmount(() => {
  if (dataUri.value) {
    URL.revokeObjectURL(dataUri.value);
  }
});

</script>

<template>
  <div v-if="dataUri" class="viewer-container">
    <v-img
      v-if="type === 'image'"
      :src="dataUri"
      max-height="100%"
      max-width="100%"
    />
    <video
      v-if="type === 'video'"
      :key="dataUri"
      :src="dataUri"
      controls
      class="raw-media"
    />

    <v-img
      v-if="type === 'audio'"
      src="/bop.gif"
      max-height="300px"
      width="100%"
      :class="{ 'mb-4 bop': true, 'bop-hidden': !showBop }"
    />
    <audio
      v-if="type === 'audio'"
      :key="dataUri"
      :src="dataUri"
      ref="audio"
      controls
      class="raw-media audio-player"
    />
  </div>
</template>

<style scoped lang="scss">
.viewer-container {
  height: calc(100% - 1px);
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-content: center;
  padding: 64px;
}

.viewer-container .raw-media {
  max-width: 100%;
  max-height: 100%;
}

.viewer-container .audio-player {
  width: 600px;
}

.viewer-container .bop {
  opacity: 1;
  transition: opacity 3s ease-in-out;
}

.viewer-container .bop-hidden {
  opacity: 0;
}
</style>
