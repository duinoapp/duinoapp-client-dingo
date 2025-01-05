<script setup lang="ts">
import { VNumberInput } from 'vuetify/labs/VNumberInput';
import { getFileDefFromFileName } from '~/components/code/code-utils';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';

const props = defineProps({
  ...nodeViewProps,
});

const editorModels = useEditorModels();
const projects = useProjects();
const tabs = useTabs();

const path = computed({
  get: () => props.node.attrs.path,
  set: (path: string) => props.updateAttributes({ path }),
});

const lineNumber = computed({
  get: () => Number(props.node.attrs.lineNumber),
  set: (num: number) => props.updateAttributes({ lineNumber: `${num}` }),
});

const ro = computed<boolean>({
  get: () => props.node.attrs.readonly === 'true',
  set: (value: boolean) => props.updateAttributes({ readonly: value ? 'true' : 'false' }),
});

const selectedUri = ref<string | null>(null);
const notFound = ref(false);

const uri = computed(() => path.value ? editorModels.getUriString(projects.currentProjectId!, path.value) : null);
const editorType = computed(() => (uri.value ? getFileDefFromFileName(uri.value)?.editor ?? 'code' : null));
const isMedia = computed(() => ['image', 'video', 'audio'].includes(editorType.value ?? ''));
const isEditor = computed(() => ['code', 'rich-text'].includes(editorType.value ?? ''));
const currentPath = computed(() => tabs.currentTab?.path);
// const path = computed(() => editorModels.parseUri(uri.value).path);

const height = computed(() => {
  if (notFound.value) return 'auto';
  switch (editorType.value) {
    case 'image':
    case 'video':
      return '500px';
    case 'code':
    case 'rich-text':
      return '500px';
    default:
      return 'auto';
  }
});

const loadFile = async () => {
  if (!uri.value) return;
  await editorModels.waitUntilReady(true);
  const { projectId, path } = editorModels.parseUri(uri.value);

  const model = await editorModels.getModel(projectId, path);
  if (model) {
    selectedUri.value = uri.value;
    notFound.value = false;
  } else {
    notFound.value = true;
  }
};

const updatePath = (pathStr: string) => {
  path.value = pathStr;
  lineNumber.value = 1;
};

watch(uri, loadFile, { immediate: true });

</script>

<template>
  <node-view-wrapper class="vue-component">
    <div>

      <div class="content" :style="{ height }">
        <directory-select
          v-if="!uri"
          :exclude-path="currentPath"
          label="Select a file to display"
          type="file"
          variant="outlined"
          hide-details="auto"
          class="my-4"
          style="max-width: 400px;"
          @update:model-value="updatePath($event ?? '')"
        />
        <media-view
          v-else-if="isMedia && selectedUri"
          :uri="selectedUri"
          :type="editorType as 'image' | 'video' | 'audio'"
          no-padding
        />
        <code-editor
          v-else-if="isEditor && selectedUri"
          :uri="selectedUri"
          :line-number="lineNumber"
          :readonly="ro"
        />
        <div v-else-if="notFound" class="not-found">
          <v-alert type="warning" variant="tonal" class="d-inline-flex flex-grow-0">
            File not found
          </v-alert>
        </div>
      </div>
      <label v-if="!uri">
        Display a file
        <v-btn size="xx-small" variant="text" icon @click="deleteNode()">
          <v-icon>mdi-trash-can-outline</v-icon>
          <v-tooltip activator="parent" location="top">
            Delete
          </v-tooltip>
        </v-btn>
      </label>
      <label v-else>
        {{ path }}

        <v-btn v-show="isEditor" size="xx-small" variant="text" icon>
          <v-icon>mdi-format-list-numbered</v-icon>
          <v-tooltip activator="parent" location="top">
            Default to line {{ lineNumber }}
          </v-tooltip>
          <v-menu activator="parent" :close-on-content-click="false">
            <v-card>
              <v-card-text>
                <v-number-input
                  v-model.number="lineNumber"
                  type="number"
                  density="compact"
                  variant="outlined"
                  :min="1"
                  hide-details
                  width="150"
                  @click.stop
                />
              </v-card-text>
            </v-card>
          </v-menu>
        </v-btn>

        <v-btn v-show="editorType === 'code'" size="xx-small" variant="text" icon @click="ro = !ro">
          <v-icon>mdi-lock{{ ro ? '' : '-open' }}</v-icon>
          <v-tooltip activator="parent" location="top">
            Read only mode ({{ ro ? 'on' : 'off' }})
          </v-tooltip>
        </v-btn>

        <v-btn size="xx-small" variant="text" icon @click="updatePath('')">
          <v-icon>mdi-close</v-icon>
          <v-tooltip activator="parent" location="top">
            Clear selected file
          </v-tooltip>
        </v-btn>
      </label>
    </div>
  </node-view-wrapper>
</template>

<style scoped lang="scss">
 
.vue-component {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 0.5rem;
  margin: 2rem 0;
  position: relative;

  label {
    background-color: rgb(var(--v-theme-primary));
    border-radius: 0 0.3rem 0 0.5rem;
    color: rgb(var(--v-theme-on-primary));
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .content {
    padding: 1rem;
    max-height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .not-found {
    display: flex;
    justify-content: center;

    .v-alert {
      width: fit-content;
      flex: none;
    }
  }
}

</style>
