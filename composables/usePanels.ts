export type LeftPanelType = 'explore' | 'projects' | 'search' | 'examples' | 'servers';

export const usePanels = defineStore('panels', () => {
  const panelState = useLocalStorage('panels', {
    isLeftPanelCollapsed: false,
    isBottomPanelCollapsed: false,
    leftPanelType: 'projects' as LeftPanelType,
  }, { mergeDefaults: true });

  const layoutState = reactive({
    horizontal: Math.random(),
    vertical: Math.random(),
  });

  const onVLayoutChange = () => {
    layoutState.vertical = Math.random();
  }

  const onHLayoutChange = () => {
    layoutState.horizontal = Math.random();
  }

  return {
    panelState,
    layoutState,
    onVLayoutChange,
    onHLayoutChange,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePanels, import.meta.hot))
}
