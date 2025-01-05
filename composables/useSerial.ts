import { WebSerialPortPromise } from '@duinoapp/upload-multitool';

const baudRateItems = [
  300,
  1200,
  2400,
  4800,
  9600,
  14400,
  19200,
  38400,
  57600,
  115200,
  128000,
  256000,
];

export const useSerial = defineStore('serial', () => {
  const projects = useProjects();
  const compiler = useCompiler();
  const uploader = useUploader();
  const serialTerm = useSerialTerminal();

  const port = shallowRef(null as WebSerialPortPromise | null);
  const connecting = ref(false);

  const settings = computed(() => projects.settings?.monitor || {});
  const updateSettings = (newSettings: typeof settings.value) => {
    projects.updateSettings({ monitor: { ...settings.value, ...newSettings } });
  }
  const baudRate = computed({
    get: () => settings.value.baudRate || 115200,
    set: (value) => updateSettings({ baudRate: value }),
  });
  const appendNewLine = computed({
    get: () => settings.value.appendNewLine || false,
    set: (value) => updateSettings({ appendNewLine: value }),
  });
  const encoding = computed({
    get: () => settings.value.encoding || 'utf8',
    set: (value) => updateSettings({ encoding: value }),
  });

  const handleData = (data: Buffer) => {
    if (compiler.compiling || uploader.uploading) return;
    serialTerm.write(data.toString(encoding.value));
  };
  const handleClose = () => {
    if (port.value) unregisterPort(port.value);
    port.value = null;
  }

  const registerPort = (newPort: WebSerialPortPromise) => {
    newPort.on('data', handleData);
    newPort.on('close', handleClose);
    port.value = newPort;
  }
  const unregisterPort = (oldPort: WebSerialPortPromise) => {
    oldPort?.off?.('data', handleData);
    oldPort?.off?.('close', handleClose);
  }

  const open = async () => {
    if (port.value) return;
    connecting.value = true;
    const webPort = await WebSerialPortPromise.requestPort(
      {},
      { baudRate: baudRate.value },
    );
    registerPort(webPort);
    connecting.value = false;
    if (!port.value) throw new Error('No serial port selected.');
  };

  const close = () => {
    if (port.value) {
      unregisterPort(port.value);
      port.value.close();
      port.value = null;
    }
  };

  const updatePort = async (newPort: WebSerialPortPromise) => {
    if (!newPort || port.value?.key === newPort?.key) return;
    if (port.value) unregisterPort(port.value);
    if (port.value?.isOpen) await port.value.close();
    registerPort(newPort);
  }

  watch(baudRate, async (value) => {
    if (port.value) {
      await port.value.update({ baudRate: value });
    }
  });

  return {
    port: computed(() => port.value),
    webPort: computed(() => port.value?.port),
    updatePort,
    baudRate,
    baudRateItems,
    encoding,
    appendNewLine,
    connecting,
    open,
    close,
  };
});


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSerial, import.meta.hot))
}
