/* eslint-disable react-refresh/only-export-components */
import { toast } from 'react-hot-toast';
import type { FocusEvent, KeyboardEvent, ClipboardEvent } from 'react';
import type { MediaItem } from './main';

const CLOUD_NAME = 'dcffpnzxn';
const UPLOAD_PRESET = 'galeria_preset';

export const MAX_FILE_SIZE_MB = 15;
export const MAX_IMAGE_SIZE_MB = 1;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const MAX_TEXT_LIMITS = {
  badge: 24,
  title: 70,
  subtitle: 110,
  description: 360,
  secondaryTitle: 60,
  secondaryDescription: 260,
  imageAlt: 90,
} as const;

// --- Funções de Transformação e Cloudinary ---

export function forceMp4(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length < 2) return url;

  const basePath = parts[1].replace(/\.(mp4|webm|ogg|mov|mkv|avi)$/i, '');
  const transformations = 'f_mp4,vc_h264:main,q_auto,fl_streaming_attachment';

  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transformations}/${basePath}.mp4`;
}

export const deleteFromCloudinary = async (
  item: MediaItem | { delete_token?: string }
): Promise<boolean> => {
  if (!item?.delete_token) return true;

  try {
    const formData = new FormData();
    formData.append('token', item.delete_token);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`,
      {
        method: 'POST',
        body: formData,
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Erro técnico ao apagar:', error);
    return false;
  }
};

async function uploadToCloudinary(
  file: File,
  resourceType: 'video' | 'image'
): Promise<MediaItem | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'galeria_assets');

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || 'Erro no upload');
    }

    return {
      id: crypto.randomUUID(),
      url: resourceType === 'video' ? forceMp4(data.secure_url) : data.secure_url,
      type: resourceType,
      size: data.bytes || file.size,
      delete_token: data.delete_token,
      isTemp: false,
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    return null;
  }
}

// --- Handlers de Upload ---

export const handleMultipleUploads = async (
  files: FileList,
  currentItems: MediaItem[],
  indexToReplace: number | null = null,
  callback: (newMedia: MediaItem[]) => void
) => {
  const filesArray = Array.from(files);

  const newItems: MediaItem[] = filesArray.map((file) => ({
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    type: file.type.startsWith('video') ? 'video' : 'image',
    size: file.size,
    file,
    isTemp: true,
  }));

  let finalMedia = [...currentItems];

  if (indexToReplace !== null && newItems.length > 0) {
    finalMedia[indexToReplace] = newItems[0];
  } else {
    finalMedia = [...currentItems, ...newItems].slice(0, 10);
  }

  callback(finalMedia);
};

export const handleFileUpload = async (
  file: File,
  callback: (media: MediaItem) => void,
  t?: (key: string, vars?: Record<string, string>) => string
) => {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const tempMedia: MediaItem = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      size: file.size,
      file,
      isTemp: true,
    };

    callback(tempMedia);
  };

  reader.onerror = () => {
    toast.error(t?.('fileReadError') || 'Erro ao ler o arquivo.');
  };

  reader.readAsArrayBuffer(file);
};

export const saveAllToCloudinary = async (
  items: MediaItem[],
  t?: (key: string, vars?: Record<string, string>) => string
): Promise<MediaItem[]> => {
  const promises = items.map(async (item) => {
    if (!item.isTemp || !item.file) return item;

    const uploaded = await uploadToCloudinary(item.file, item.type);

    if (uploaded) {
      URL.revokeObjectURL(item.url);
      toast.success(t?.('uploadSuccess') || 'Upload concluído com sucesso.');
      return uploaded;
    }

    toast.error(t?.('uploadError') || 'Falha ao enviar o arquivo.');
    return item;
  });

  return Promise.all(promises);
};

// --- Helpers de UI e Texto ---

export const editableProps = (
  isEditable: boolean,
  onUpdate: (val: string) => void
) => ({
  contentEditable: isEditable,
  suppressContentEditableWarning: true,
  onBlur: (e: FocusEvent<HTMLElement>) => {
    onUpdate(e.currentTarget.innerText);
  },
  className: isEditable
    ? 'outline-none focus:ring-2 focus:ring-blue-500/30 rounded px-1 cursor-text'
    : '',
});

export const getTheme = (theme?: 'light' | 'dark') => {
  if (theme === 'dark') return 'bg-slate-950 text-white';
  return 'bg-white text-slate-900';
};

export const getFontSize = (
  size: string = 'medium',
  type: 'card' | 'h1' | 'h2' | 'h3' | 'p' = 'h1'
): string => {
  const sizes: Record<'h1' | 'h2' | 'h3' | 'p' | 'card', Record<string, string>> = {
    h1: { small: 'text-2xl md:text-4xl', medium: 'text-3xl md:text-5xl', large: 'text-4xl md:text-5xl 2xl:text-6xl' },
    h2: { small: 'text-xl md:text-2xl', medium: 'text-2xl md:text-4xl', large: 'text-3xl md:text-5xl' },
    h3: { small: 'text-xl', medium: 'text-2xl', large: 'text-4xl' },
    p: { small: 'text-sm', medium: 'text-base', large: 'text-lg' },
    card: { small: 'text-xs', medium: 'text-sm', large: 'text-base' },
  };

  const selectedType = sizes[type];
  return selectedType[size] || selectedType.medium;
};

export const clampText = (value: string, max: number, maxBreaks: number = 1) => {
  const clean = (value || '').replace(/\r/g, '');
  const lines = clean.split('\n').slice(0, maxBreaks + 1);
  const normalized = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  return normalized.slice(0, max);
};

export const normalizeText = (value: unknown, fallback: string, max: number, maxBreaks: number = 1) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return fallback;
  return clampText(text, max, maxBreaks);
};

export const handleEditableKeyDown = (
  e: KeyboardEvent<HTMLElement>,
  max: number,
  maxBreaks: number = 1,
  singleLine: boolean = false,
  t?: (key: string, vars?: Record<string, string>) => string
) => {
  const text = e.currentTarget.innerText || '';
  const lineBreaks = (text.match(/\n/g) || []).length;

  if (e.key === 'Enter') {
    if (singleLine || lineBreaks >= maxBreaks) {
      e.preventDefault();
      toast.error(t?.('limitLines') || 'Limite de linhas atingido.', { id: 'line-limit' });
    }
    return;
  }

  const safeKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Escape'];
  if (safeKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;

  if (text.length >= max) {
    e.preventDefault();
    toast.error(t?.('limits', { max: String(max) }) || `Máximo de ${max} caracteres.`, { id: 'char-limit' });
  }
};

export const handleEditablePaste = (
  e: ClipboardEvent<HTMLElement>,
  max: number,
  maxBreaks: number = 1
) => {
  e.preventDefault();
  const pasted = e.clipboardData.getData('text/plain') || '';
  const lines = pasted.split(/\r?\n/).slice(0, maxBreaks + 1);
  const finalText = clampText(lines.join('\n'), max, maxBreaks);

  if (document.queryCommandSupported('insertText')) {
    document.execCommand('insertText', false, finalText);
  } else {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(finalText));
    selection.collapseToEnd();
  }
};

export const formatBytes = (bytes: number = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// --- Manipulação de Imagem ---

export function getFixedCropAspect(layout?: string) {
  switch (layout) {
    case '2': return 16 / 10;
    case '4': return 1;
    case '1':
    default: return 4 / 5;
  }
}

export async function compressImageToUnder1MB(file: File): Promise<File> {
  if (file.size <= MAX_IMAGE_SIZE_BYTES) return file;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;
  const maxWidth = 1400;

  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não disponível');

  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.9;
  let blob: Blob | null = null;

  while (quality >= 0.45) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
    if (blob && blob.size <= MAX_IMAGE_SIZE_BYTES) break;
    quality -= 0.08;
  }

  if (!blob) throw new Error('Não foi possível comprimir a imagem.');

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

export async function cropImageFile(
  file: File,
  cropPixels: { x: number; y: number; width: number; height: number }
): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não disponível');

  ctx.drawImage(
    img, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, cropPixels.width, cropPixels.height
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.92);
  });

  if (!blob) throw new Error('Não foi possível recortar a imagem.');

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

export async function uploadImageToCloudinary(file: File): Promise<{
  url: string;
  delete_token?: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'galeria_assets');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Falha ao enviar imagem.');

  return {
    url: data.secure_url,
    delete_token: data.delete_token,
    size: data.bytes || file.size,
  };
}