import type { ElementType } from 'react';
import type { useTranslate } from '../context/LanguageContext';
import type { SectionProps } from './library';

export type TranslateFn = ReturnType<typeof useTranslate>['t'];

export interface TextoImagemContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  secondaryTitle?: string;
  secondaryDescription?: string;
  image?: string;
  imageAlt?: string;
  imageDeleteToken?: string;
  imageSize?: number;
  pendingImage?: {
    isTemp: boolean;
    size: number;
    name?: string;
    updatedAt: number;
  } | null;
}

export interface TextoImagemShowcaseProps extends Omit<SectionProps, 'content'> {
  content: TextoImagemContent;
}

export interface EditableFieldProps {
  as?: ElementType;
  value: string;
  fallback: string;
  max: number;
  maxBreaks?: number;
  singleLine?: boolean;
  isEditable: boolean;
  isDark: boolean;
  className?: string;
  t: TranslateFn;
  onUpdate: (val: string) => void;
}