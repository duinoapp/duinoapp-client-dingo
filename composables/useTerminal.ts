type TerminalType = 'serial' | 'program';

const defineTerminalStore = (type: TerminalType) => defineStore(`terminal-${type}`, () => {

  const write = (raw: string) => {};

  const clear = () => {};

  return {
    write,
    clear,
  };
});

export const useSerialTerminal = defineTerminalStore('serial');
export const useProgramTerminal = defineTerminalStore('program');

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProgramTerminal, import.meta.hot))
  import.meta.hot.accept(acceptHMRUpdate(useSerialTerminal, import.meta.hot))
}
