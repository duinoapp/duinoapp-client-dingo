import { asyncTimeout } from './general';

export const parseJsonl = async (arrayBuff: ArrayBuffer): Promise<any[]> => {
  let current = [];
  const arr = [];
  for (let i = 0; i < arrayBuff.byteLength; i++) {
    const charCode = new Uint8Array(arrayBuff.slice(i, i + 1))[0];
    const char = String.fromCharCode(charCode);
    if (char === '\n') {
      const json = new TextDecoder().decode(Uint8Array.from(current));
      try {
        const parsed = JSON.parse(json);
        arr.push(parsed);
        if (arr.length % 50 === 0) {
          await asyncTimeout(0);
        }
      } catch (e) {
        console.error('Failed to parse JSONL:', json);
      }
      current = [];
    } else {
      current.push(charCode);
    }
  }
  return arr;
}
