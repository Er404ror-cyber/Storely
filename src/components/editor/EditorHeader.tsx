import { Layers, ExternalLink } from 'lucide-react';

interface EditorHeaderProps {
  onOpenMobileMenu: () => void;
  onPreview: () => void;
}

export function EditorHeader({ onOpenMobileMenu, onPreview }: EditorHeaderProps) {
  return (
    <header className="h-16 bg-white/80 border-b flex items-center justify-between px-6 gap-4 z-40">
      <div className="flex-1"></div>
      
      <button 
        onClick={onOpenMobileMenu} 
        className="md:hidden p-2 text-slate-400 hover:text-blue-600"
      >
        <Layers size={22}/>
      </button>
      
      <button onClick={onPreview} className="p-2 text-slate-400 hover:text-blue-600">
        <ExternalLink size={20}/>
      </button>
    </header>
  );
}