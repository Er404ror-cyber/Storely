import type { Section } from '../types/editor';

interface PendingItem {
  isTemp?: boolean;
  size?: number;
}

export function getSectionPendingItems(section: Section): PendingItem[] {
  const content = (section.content || {}) as Record<string, unknown>;

  const images = Array.isArray(content.images) ? content.images : [];
  const media = content.media ? [content.media] : [];
  const singleImagePending = content.pendingImage ? [content.pendingImage] : [];

  return [...images, ...media, ...singleImagePending].filter(Boolean) as PendingItem[];
}

export function sectionHasPendingUploads(section: Section): boolean {
  return getSectionPendingItems(section).some((item) => item?.isTemp);
}

export function sectionTotalPendingBytes(section: Section): number {
  return getSectionPendingItems(section).reduce(
    (acc, item) => acc + (item?.size || 0),
    0
  );
}

export function cloneSections<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}