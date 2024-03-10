import { upload, isSupported } from '@duinoapp/upload-multitool';
import type { ProgramConfig } from '@duinoapp/upload-multitool';

export const useUploader = defineStore('uploader', () => {
  const compiler = useCompiler();
  const programTerm = useProgramTerminal();
  const serialTerm = useSerialTerminal();
  const serial = useSerial();

  const uploading = ref(false);

  const uploader = async () => {
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
      uploadSpeed: 115200,
      tool: 'avr',
      cpu: 'atmega328p',
      stdout: programTerm,
      verbose: true,
    } as ProgramConfig;

    const res = await upload(serial.port, config);
    serial.updatePort(res.serialport);
    if (!keepOpen) {
      if (serial.port?.isOpen) await serial.close();
    }

    programTerm.write('\r\n\r\nUpload complete. Have a nice day :)\r\n');
    serialTerm.clear();

    uploading.value = false;
  };

  return {
    uploading,
    upload: uploader,
    isSupported,
  };
});


if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUploader, import.meta.hot))
}
