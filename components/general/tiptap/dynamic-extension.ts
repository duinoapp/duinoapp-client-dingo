import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import DynamicComponent from './dynamic-component.vue'

export default Node.create({
  name: 'dynamicComponent',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      path: {
        default: '',
      },
      lineNumber: {
        default: '1',
      },
      readonly: {
        default: 'false',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'dynamic-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['dynamic-component', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(DynamicComponent as Component)
  },
})
