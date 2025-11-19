// src/components/FullScreenModal.tsx
import React from 'react';
import type { FullScreenModalProps } from '../../types/details';

// ➡️ Aplica o tipo à função de componente
const FullScreenModal: React.FC<FullScreenModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    // ... (restante do JSX)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 md:p-10 cursor-zoom-out transition-opacity duration-300"
      onClick={onClose}
    >
      
      <button 
        className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 text-2xl font-bold z-10 hover:bg-gray-200 transition duration-200 shadow-lg"
        onClick={onClose}
        aria-label="Fechar visualização em tela cheia"
      >
        &times;
      </button>

      <div 
        className="relative w-full h-full flex items-center justify-center" 
        onClick={e => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Visualização em Tela Cheia do Produto" 
          className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-fade-in" 
          style={{ width: 'auto', height: 'auto', maxWidth: '100vw', maxHeight: '100vh' }}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FullScreenModal;