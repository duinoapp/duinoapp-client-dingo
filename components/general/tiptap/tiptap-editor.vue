<script lang="ts" setup>
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  BubbleMenu, FloatingMenu, useEditor, EditorContent,
} from '@tiptap/vue-3';
import { type ErrorObject, useVuelidate } from '@vuelidate/core';
import type { BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu';
import { isTextSelection } from '@tiptap/core';
import {
  required, url as urlValid, helpers,
} from '@vuelidate/validators';
import DynamicExtension from './dynamic-extension';

const props = withDefaults(defineProps<{
  modelValue: string;
  readonly?: boolean;
}>(), {
  modelValue: '',
  readonly: false,
});
const emit = defineEmits(['update:modelValue']);

const md = useVModel(props, 'modelValue', emit);
const raw = ref('');
const link = ref('');
const linkMenu = ref(false);

const { fromMd, toMd } = useMarkdown();
const editor = useEditor({
  editable: !props.readonly,
  extensions: [
    StarterKit,
    DynamicExtension,
    Placeholder.configure({
      placeholder: () => (props.readonly ? 'No content' : 'Start typing...'),
    }),
    Underline,
    Link.configure({
      openOnClick: 'whenNotEditable',
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  ],
  onUpdate: () => {
    raw.value = editor.value?.getHTML() ?? '';
  },
});

// setting content unfocuses the editor, so we wont use this for now
// watchDebounced(() => md.value, async () => {
//   const html = await fromMd({ value: md.value });
//   const content = editor.value?.getHTML();
//   if (content !== html) {
//     editor.value?.commands.setContent(html);
//   }
// }, { immediate: true, debounce: 100 });

onMounted(async () => {
  raw.value = await fromMd({ value: md.value });
  editor.value?.commands.setContent(raw.value);
});

watch(() => raw.value, async () => {
  const markdown = toMd(raw.value);
  if (md.value.replace(/\s/g, '') !== markdown.replace(/\s/g, '')) {
    md.value = markdown;
  }
});
watch(() => props.readonly, (val) => {
  editor.value?.setOptions({ editable: !val });
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const rules = computed(() => ({
  link: {
    required: helpers.withMessage('Link is required', required),
    url: helpers.withMessage('Link must be valid', urlValid),
  },
}));
const v$ = useVuelidate(rules, {
  link,
});
const getErrors = (errors?: ErrorObject[]) => (errors || []).map((e) => e.$message) as string[];
watch(() => linkMenu.value, (val) => {
  if (val) {
    link.value = editor.value?.isActive('link') ? editor.value?.getAttributes('link').href : '';
    v$.value.$reset();
  }
});
const linkSubmit = () => {
  v$.value.link.$touch();
  if (!v$.value.link.$invalid) {
    editor.value?.chain().focus().setLink({ href: link.value }).run();
    linkMenu.value = false;
  }
};
const unlink = () => {
  editor.value?.chain().focus().unsetLink().run();
  linkMenu.value = false;
};

const shouldShow: BubbleMenuPluginProps['shouldShow'] = ({
  view,
  state,
  from,
  to,
  element,
  editor,
}) => {
  const { doc, selection } = state
  const { empty } = selection

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)

  // When clicking on a element inside the bubble menu the editor "blur" event
  // is called and the bubble menu item is focussed. In this case we should
  // consider the menu as part of the editor and keep showing the menu
  const isChildOfMenu = element.contains(document.activeElement)

  const hasEditorFocus = view.hasFocus() || isChildOfMenu

  if (!hasEditorFocus || empty || isEmptyTextBlock || !editor.isEditable) {
    return false;
  }

  if (editor.isActive('dynamicComponent')) {
    return false;
  }

  return true;
};

</script>

<template>
  <floating-menu v-if="editor" :editor="editor" :tippy-options="{ duration: 100, maxWidth: '370px' }">
    <v-toolbar density="compact" rounded="pill" elevation="4" class="ml-8">
      <v-btn
        icon="mdi-format-header-1"
        size="small"
        :active="editor.isActive('heading', { level: 1 })"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      />
      <v-btn
        icon="mdi-format-header-2"
        size="small"
        :active="editor.isActive('heading', { level: 2 })"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      />
      <v-btn
        icon="mdi-format-header-3"
        size="small"
        :active="editor.isActive('heading', { level: 3 })"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      />
      <v-btn
        icon="mdi-format-list-bulleted"
        size="small"
        :active="editor.isActive('bulletList')"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <v-btn
        icon="mdi-format-list-numbered"
        size="small"
        :active="editor.isActive('orderedList')"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <v-btn
        icon="mdi-format-quote-open"
        size="small"
        :active="editor.isActive('blockquote')"
        @click="editor.chain().focus().toggleBlockquote().run()"
      />
      <v-btn
        icon="mdi-minus"
        size="small"
        @click="editor.chain().focus().setHorizontalRule().run()"
      />
      <v-btn
        icon="mdi-xml"
        size="small"
        :active="editor.isActive('codeBlock')"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      />
      <v-btn
        icon="mdi-file-document-plus-outline"
        size="small"
        @click="editor.chain().focus().insertContent({ type: 'dynamicComponent' }).run()"
      />
    </v-toolbar>
  </floating-menu>
  <bubble-menu
    v-if="editor"
    :editor="editor"
    :tippy-options="{ duration: 100 }"
    :should-show="shouldShow"
  >
    <v-toolbar density="compact" rounded="pill" elevation="4">
      <v-btn
        icon="mdi-format-bold"
        size="small"
        :active="editor.isActive('bold')"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <v-btn
        icon="mdi-format-italic"
        size="small"
        :active="editor.isActive('italic')"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <v-btn
        icon="mdi-format-underline"
        size="small"
        :active="editor.isActive('underline')"
        @click="editor.chain().focus().toggleUnderline().run()"
      />
      <v-btn
        icon="mdi-format-strikethrough-variant"
        size="small"
        :active="editor.isActive('strike')"
        @click="editor.chain().focus().toggleStrike().run()"
      />
      <v-btn
        icon="mdi-code-tags"
        size="small"
        :active="editor.isActive('code')"
        @click="editor.chain().focus().toggleCode().run()"
      />
      <v-menu v-model="linkMenu" :close-on-content-click="false" offset="8">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            :active="editor.isActive('link')"
            icon="mdi-link"
            size="small"
          />
        </template>
        <v-text-field
          v-model="link"
          :error-messages="getErrors(v$.link.$errors)"
          label="Link"
          placeholder="https://"
          density="compact"
          elevation="6"
          :flat="false"
          style="width:300px"
          class="pr-0"
          autofocus
          @blur="v$.link.$touch()"
          @keydown.enter="linkSubmit"
        >
          <template #append-inner>
            <v-btn
              icon="mdi-check"
              size="x-small"
              variant="text"
              @click="linkSubmit"
            />
            <v-btn
              v-show="editor.isActive('link')"
              icon="mdi-close"
              size="x-small"
              variant="text"
              @click="unlink"
            />
          </template>
        </v-text-field>
      </v-menu>
      <v-btn
        icon="mdi-format-clear"
        size="small"
        @click="editor.chain().focus().clearNodes().run()"
      />
    </v-toolbar>
  </bubble-menu>
  <editor-content v-bind="$attrs" :editor="editor" class="tiptap" />
</template>

<style scoped lang="scss">
/* Basic editor styles */
.tiptap::v-deep(.ProseMirror) {
  height: 100%;

  > :first-child {
    margin-top: 0;
  }
  &:focus-visible {
    outline: none;
  }

  p {
    margin-bottom: 1rem;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    text-wrap: pretty;
    font-family: "Brandon Text", Roboto, sans-serif;
    font-weight: bold;
    font-style: normal;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: rgb(var(--v-theme-code));
    color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
    border-radius: 0.4rem;
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: rgb(var(--v-theme-code));
    color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
    border-radius: 0.5rem;
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid rgba(var(--v-theme-on-background), 0.3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid rgba(var(--v-theme-on-background), 0.12);
    margin: 2rem 0;
  }

  /* Placeholder (at the top) */
  p.is-editor-empty:first-child::before {
    color: rgba(var(--v-theme-on-background), 0.5);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
}

/* Floating menu */
.floating-menu {
  display: flex;
  background-color: rgba(var(--v-theme-on-background), 0.1);
  padding: 0.1rem;
  border-radius: 0.5rem;

  button {
    background-color: unset;
    padding: 0.275rem 0.425rem;
    border-radius: 0.3rem;

    &:hover {
      background-color: rgba(var(--v-theme-on-background), 0.2);
    }

    &.is-active {
      background-color: rgba(var(--v-theme-primary), 0.2);
      color: rgba(var(--v-theme-primary), 0.8);

      &:hover {
        color: rgba(var(--v-theme-primary), 1);
      }
    }
  }
}

/* Bubble menu */
.bubble-menu {
  background-color: rgba(var(--v-theme-on-background), 0.1);
  border: 1px solid rgba(var(--v-theme-on-background), 0.2);
  border-radius: 0.7rem;
  box-shadow: 0 2px 4px rgba(var(--v-theme-on-background), 0.2);
  display: flex;
  padding: 0.2rem;

  button {
    background-color: unset;

    &:hover {
      background-color: rgba(var(--v-theme-on-background), 0.2);
    }

    &.is-active {
      background-color: rgba(var(--v-theme-primary), 0.2);

      &:hover {
        background-color: rgba(var(--v-theme-primary), 0.3);
      }
    }
  }
}
</style>
