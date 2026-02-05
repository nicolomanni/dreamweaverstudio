const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const hashString = async (value: string) => {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(value);
    const hash = await globalThis.crypto.subtle.digest('SHA-256', data);
    return toHex(hash);
  }
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};
