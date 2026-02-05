import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@dreamweaverstudio/client-data-access-api';

const getDataUrlInfo = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  const mimeType = match?.[1] ?? 'image/png';
  const extension = mimeType.split('/')[1] ?? 'png';
  return { mimeType, extension };
};

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

export const uploadStylePreviewImage = async (
  dataUrl: string,
  options: { styleKey: string; styleId?: string; promptHash?: string },
) => {
  const storage = getStorage(firebaseApp);
  const { extension } = getDataUrlInfo(dataUrl);
  const safeKey = options.styleKey.trim() || 'style';
  const folder = options.styleId
    ? `styles/${options.styleId}`
    : `styles/${safeKey}`;
  const fileName = options.promptHash || Date.now().toString();
  const path = `${folder}/preview/${fileName}.${extension}`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
};
