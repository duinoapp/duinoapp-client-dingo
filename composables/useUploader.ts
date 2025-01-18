import { upload, isSupported } from '@duinoapp/upload-multitool';
import type { ProgramConfig } from '@duinoapp/upload-multitool';

export const useUploader = defineStore('uploader', () => {
  const compiler = useCompiler();
  const settings = useSettings();
  const programTerm = useProgramTerminal();
  const serialTerm = useSerialTerminal();
  const serial = useSerial();
  const boards = useBoards();

  const uploading = ref(false);
  const lastError = ref<string | undefined>(undefined);
  const uploader = async () => {
    lastError.value = undefined;
    compiler.lastError = undefined;
    try {
      if (uploading.value) throw new Error('Already uploading.');
      let keepOpen = true;
      if (!serial.port) {
        keepOpen = false;
        await serial.open();
      }
      if (!serial.port) throw new Error('No serial port selected.');

      const compiled = await compiler.compile();
      programTerm.write('\r\nUploading...\r\n');
      uploading.value = true;
      
      const config = {
        bin: compiled.hex,
        files: compiled.files,
        flashFreq: compiled.flashFreq,
        flashMode: compiled.flashMode,
        speed: 115200,
        uploadSpeed: Number(boards.boardData?.options?.UploadSpeed || 115200),
        tool: boards?.currentBoard?.properties?.upload?.tool || 'avrdude',
        cpu: boards?.currentBoard?.properties?.build?.mcu || 'atmega328p',
        stdout: programTerm,
        verbose: !!settings.settings?.compiler?.verboseOutput,
      } as ProgramConfig;

      const res = await upload(serial.port, config);
      serial.updatePort(res.serialport);
      if (!keepOpen) {
        if (serial.port?.isOpen) await serial.close();
      }

      programTerm.write('\r\n\r\nUpload complete. Have a nice day :)\r\n');
      serialTerm.clear();

    } catch (e) {
      lastError.value = (e as Error).message;
      throw e;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    upload: uploader,
    isSupported,
    lastError,
  };
});


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUploader, import.meta.hot))
}
