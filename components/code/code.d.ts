import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

export interface CodeFile {
  name: string;
  content: string;
  contentType: string;
}

export type EditorOptions = monacoEditor.editor.IStandaloneEditorConstructionOptions;
