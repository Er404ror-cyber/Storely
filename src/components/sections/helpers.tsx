import React from 'react';
import type { MediaItem } from './main';

const CLOUD_NAME = "dcffpnzxn"; 
const UPLOAD_PRESET = "galeria_preset"; 
export const MAX_FILE_SIZE_MB = 15;

export function forceMp4(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length < 2) return url;

  const basePath = parts[1].replace(/\.(mp4|webm|ogg|mov|mkv|avi)$/i, '');

  
  const transformations = "f_mp4,vc_h264:main,q_auto,fl_streaming_attachment";

  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transformations}/${basePath}.mp4`;
}
/**
 * Deleta do Cloudinary usando o Token (válido por 10 minutos)
 */
export const deleteFromCloudinary = async (item: MediaItem) => {
  // Se não tiver token (ex: fotos antigas ou carregadas antes da mudança), 
  // não faz nada na nuvem, apenas remove da lista local.
  if (!item.delete_token) return;

  try {
    const formData = new FormData();
    formData.append("token", item.delete_token);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/dcffpnzxn/delete_by_token`, {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      console.log("Removido da nuvem com sucesso!");
    }
  } catch (error) {
    console.error("Erro técnico ao apagar:", error);
  }
};
/**
 * FUNÇÃO DE UPLOAD REAL
 */
// No seu helpers.ts, dentro da função uploadToCloudinary:

async function uploadToCloudinary(file: File, resourceType: 'video' | 'image'): Promise<MediaItem | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "galeria_assets"); 
  
  // REMOVA OU COMENTE A LINHA ABAIXO:
  // formData.append("return_delete_token", "true"); 

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
      method: "POST",
      body: formData
    });
    
    const data = await res.json();
    console.log("Resposta do Cloudinary:", data); // Verifique se o delete_token aparece aqui agora!

    return {
      id: crypto.randomUUID(),
      url: resourceType === 'video' ? forceMp4(data.secure_url) : data.secure_url,
      type: resourceType,
      size: data.bytes || file.size,
      delete_token: data.delete_token, // Ele deve vir aqui automaticamente se o painel estiver ON
      isTemp: false
    };
  } catch (error) {
    console.error(`Erro no upload:`, error);
    return null;
  }
}

/**
 * handleMultipleUploads: Prepara Preview
 */
export const handleMultipleUploads = async (
  files: FileList, 
  currentItems: MediaItem[],
  indexToReplace: number | null = null,
  callback: (newMedia: MediaItem[]) => void
) => {
  const filesArray = Array.from(files);
  
  const newItems: MediaItem[] = filesArray.map(file => ({
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    type: file.type.startsWith('video') ? 'video' : 'image',
    size: file.size,
    file: file,
    isTemp: true
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
  callback: (media: MediaItem) => void
) => {
  const media: MediaItem = {
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    type: file.type.startsWith('video') ? 'video' : 'image',
    size: file.size,
    file: file,
    isTemp: true
  };
  callback(media);
};

/**
 * Sobe tudo que é temporário para a nuvem
 */
export const saveAllToCloudinary = async (items: MediaItem[]): Promise<MediaItem[]> => {
  const promises = items.map(async (item) => {
    if (!item.isTemp || !item.file) return item;

    const uploaded = await uploadToCloudinary(item.file, item.type);
    if (uploaded) {
      URL.revokeObjectURL(item.url); 
      return uploaded;
    }
    return item;
  });

  return Promise.all(promises);
};

// --- Funções de Estilo ---
export const getTheme = (theme: string | undefined) => 
  theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';

export const getFontSize = (
  size: string = 'medium', 
  type: 'card' | 'h1' | 'h2' | 'h3' | 'p' = 'h1'
): string => {
  
  // Incluímos 'card' no Record
  const sizes: Record<'h1' | 'h2' | 'h3' | 'p' | 'card', Record<string, string>> = {
    h1: { small: 'text-3xl', medium: 'text-5xl', large: 'text-6xl' },
    h2: { small: 'text-xl md:text-2xl', medium: 'text-2xl md:text-4xl', large: 'text-3xl md:text-5xl' },
    h3: { small: 'text-xl', medium: 'text-2xl', large: 'text-4xl' },
    p:  { small: 'text-sm',  medium: 'text-base', large: 'text-lg' },
    card: { small: 'text-xs', medium: 'text-sm', large: 'text-base' } // Exemplo de valores
  };

  // Agora o TS sabe que 'type' sempre existirá em 'sizes'
  const selectedType = sizes[type];
  return selectedType[size] || selectedType['medium'];
};
export const editableProps = (isEditable: boolean, onBlur: (val: string) => void) => ({
  contentEditable: isEditable,
  suppressContentEditableWarning: true,
  onBlur: (e: React.FocusEvent<HTMLElement>) => onBlur(e.currentTarget.innerText),
  className: `outline-none focus:ring-2 focus:ring-blue-500/40 rounded px-1 transition-all`
});