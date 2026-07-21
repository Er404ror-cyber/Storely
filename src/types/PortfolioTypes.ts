import React from 'react';

export interface SectionStyles {
  theme?: 'dark' | 'light';
  cols?: '1' | '2' | '4';
  fontSize?: 'small' | 'medium' | 'large' | 'base';
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface PortfolioContent {
  alias?: string;
  fullName?: string;
  playerImageUrl?: string;
  flagUrl?: string;
  countryCode?: string;
  backgroundText?: string;
  socials?: SocialLink[];
  s1Label?: string;
  s1Val?: string;
  s2Label?: string;
  s2Val?: string;
  s3Label?: string;
  s3Val?: string;
  // Permite indexação dinâmica sem recorrer ao "any"
  [key: string]: string | SocialLink[] | undefined | unknown; 
}

export interface SectionProps {
  content: PortfolioContent;
  style?: SectionStyles;
  onUpdate?: (k: string, v: unknown) => void;
}

export interface LayoutProps {
  c: PortfolioContent;
  isEditor: boolean;
  isDark: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'base';
  displayImage: string;
  editableClass: string;
  handleTextEdit: (key: string) => (e: React.FormEvent<HTMLDivElement>) => void;
  handleKeyDown: (maxLength: number) => (e: React.KeyboardEvent<HTMLDivElement>) => void;
  RenderStats: React.FC<{ isVertical?: boolean }>;
  RenderSocialsAndFlag: React.FC;
  style?: {
    theme?: 'light' | 'dark';
  };
}