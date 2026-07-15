import { SectionLibrary } from '../components/sections/main';

export interface SectionStyle {
  cols: "1" | "2" | "4";
  theme: 'light' | 'dark';
  align: 'left' | 'center' | 'justify';
  fontSize: 'small' | 'base' | 'large';
}

export interface Section {
  id: string;
  type: keyof typeof SectionLibrary;
  content: Record<string, unknown>; 
  style: SectionStyle;
}

export type ModalType = 'SAVE' | 'DISCARD' | 'NAVIGATION' | null;

export interface SidebarContentProps {
  sections: Section[];
  activeSection: Section | undefined;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  updateStyle: (id: string, k: keyof SectionStyle, v: string) => void;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setShowAddModal: (show: boolean) => void;
}