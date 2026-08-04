import { Plus } from 'lucide-react';
import { memo } from 'react';

interface EditorFabProps {
  onAdd: () => void;
  isDisabled: boolean;
}

export const EditorFab = memo(function EditorFab({ onAdd, isDisabled }: EditorFabProps) {
  return (
    <button
      onClick={onAdd}
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform ${
        isDisabled
          ? 'bg-slate-200 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      <Plus size={36} className={isDisabled ? 'text-slate-400' : 'text-white'} />
    </button>
  );
});