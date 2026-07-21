import { memo, useCallback, useMemo, useState } from 'react';
import { 
  X, Plus, LayoutTemplate, ImageIcon, Star, AlignLeft, Phone, Layers 
} from 'lucide-react';
import { SectionLibrary } from '../sections/main';
import { useTranslate } from '../../context/LanguageContext';
import type { Section } from '../../types/editor';

// Tipagem para a função de tradução
type TranslateFn = ReturnType<typeof useTranslate>['t'];

export interface AddSectionModalProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setEditingId: (id: string | null) => void;
}

interface BlockItemProps {
  type: string;
  previewUrl?: string;
  onClick: (type: string) => void;
  t: TranslateFn;
}

// Constantes estáticas fora do render para poupar memória RAM
const SECTION_PREVIEWS: Record<string, string> = {
  hero_comercial: '/img/hero_comercial.png',
  galeria_grid: '/img/galeria_grid.png',
  vitrine_produtos: '/img/vitrine_produtos.png',
  texto_narrativo: '/img/texto_narativo.png',
  texto_imagem_showcase: '/img/texto_imagem_showcase.png',
  
  estatisticas_larga: '',
  servicos_modern: '',
  precos_moderno: '',
  contacto_mapa: '',
  media_embeds: '',
  esports_profile: '',
  hero_minimalista: '',
  tabela_precos: '',
  depoimentos_clientes: '',
  faq_acordion: '',
  rodape_simples: '',
};

const SECTION_CATEGORIES: Record<string, string> = {
  hero_comercial: 'hero',
  hero_minimalista: 'hero',
  esports_profile: 'hero',
  
  galeria_grid: 'media',
  vitrine_produtos: 'media',
  media_embeds: 'media',
  
  estatisticas_larga: 'features',
  servicos_modern: 'features',
  precos_moderno: 'features',
  tabela_precos: 'features',
  
  texto_imagem_showcase: 'content',
  texto_narrativo: 'content',
  faq_acordion: 'content',
  depoimentos_clientes: 'content',
  
  contacto_mapa: 'contact',
  rodape_simples: 'contact',
};

const CATEGORY_UI: Record<string, { key: string, fallback: string, icon: any }> = {
  hero: { key: 'cat_hero', fallback: 'Heróis & Cabeçalhos', icon: LayoutTemplate },
  media: { key: 'cat_media', fallback: 'Mídia & Imagens', icon: ImageIcon },
  features: { key: 'cat_features', fallback: 'Recursos & Preços', icon: Star },
  content: { key: 'cat_content', fallback: 'Conteúdo & Textos', icon: AlignLeft },
  contact: { key: 'cat_contact', fallback: 'Contato & Rodapé', icon: Phone },
  other: { key: 'cat_other', fallback: 'Outros Elementos', icon: Layers },
};

const CATEGORY_ORDER = ['hero', 'media', 'features', 'content', 'contact', 'other'];

const getReadableSectionName = (type: string, t: TranslateFn) => {
  // Cast para any contorna o erro de tipagem estrita para chaves geradas dinamicamente
  const key = `section_${type}`;
  const translated = t(key as any);
  if (translated && translated !== key) return translated;
  return type.replace(/[_-]+/g, ' ').replace(/([A-Z])/g, ' $1').trim();
};

const BlockItem = memo(({ type, previewUrl, onClick, t }: BlockItemProps) => {
  const isBeta = !previewUrl;

  return (
    <button
      type="button"
      onClick={() => onClick(type)}
      // Soft UI com áreas de toque maiores e sombras espalhadas
      className="group flex h-full w-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] active:scale-[0.98]"
    >
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-[#f8fafc] border-b border-slate-50 p-1">
        
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={getReadableSectionName(type, t)}
            className="h-full w-full object-contain "
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-center p-4 gap-3 opacity-60">
            <div className="h-3 w-2/5 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-slate-200" />
              <div className="h-2 w-4/5 rounded-full bg-slate-200" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="h-8 rounded-xl bg-slate-200" />
              <div className="h-8 rounded-xl bg-slate-200" />
            </div>
          </div>
        )}

        {isBeta && (
          // Nova cor para o Beta: Âmbar suave (Soft Amber) para destacar sem gritar
          <div className="absolute top-3 right-3 rounded-full border border-amber-200/60 bg-amber-50/95 px-2.5 py-1 shadow-sm ">
            <span className="block text-[10px] font-black uppercase tracking-widest text-amber-600 leading-none mt-[1px]">
              {t('label_beta' as any) || 'Beta'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 w-full items-center justify-between px-4 py-3.5 bg-white">
        <span className="block text-[11px] font-bold uppercase leading-tight tracking-wider text-slate-700 text-left pr-3">
          {getReadableSectionName(type, t)}
        </span>
        
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-slate-500 transition-colors duration-200 group-hover:bg-blue-500 group-hover:text-white">
          <Plus size={16} strokeWidth={2.5} />
        </div>
      </div>
    </button>
  );
}, (prev, next) => prev.type === next.type && prev.previewUrl === next.previewUrl);

BlockItem.displayName = 'BlockItem';

export const AddSectionModal = memo(({
  showAddModal,
  setShowAddModal,
  setSections,
  setEditingId,
}: AddSectionModalProps) => {
  const { t } = useTranslate();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleAddSection = useCallback((selectedType: string) => {
    const newId = crypto.randomUUID();
    const newSection: Section = {
      id: newId,
      type: selectedType as any,
      content: {},
      style: { cols: '1', theme: 'light', align: 'left', fontSize: 'base' },
    } as Section;

    setSections((prev) => [...prev, newSection]);
    setEditingId(newId);
    setShowAddModal(false);
  }, [setSections, setEditingId, setShowAddModal]);

  const categoryGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};

    (Object.keys(SectionLibrary) as Array<keyof typeof SectionLibrary>).forEach((key) => {
      if (key === 'products_catalog') return; 

      const category = SECTION_CATEGORIES[key] || 'other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(key);
    });
    return groups;
  }, []);

  const categoriesToShow = activeFilter === 'all' 
    ? CATEGORY_ORDER 
    : CATEGORY_ORDER.filter(cat => cat === activeFilter);

  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-900/30 animate-in fade-in duration-200 md:items-center">
      <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl flex-col overflow-hidden rounded-t-[2rem] bg-[#f8fafc] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 ease-out md:rounded-[2.5rem] md:max-h-[85vh]">
        
        <div className="flex shrink-0 flex-col bg-white px-6 pt-7 pb-3 md:px-8 md:pt-8 border-b border-slate-100">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="leading-none font-black text-2xl md:text-3xl uppercase tracking-tight text-slate-800">
                {t('modal_library_title' as any) || 'Biblioteca'}
              </h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-blue-500/80">
                {t('modal_library_subtitle' as any) || 'Escolha um bloco para adicionar'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-full bg-slate-50 p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex w-full items-center gap-2.5 overflow-x-auto pb-3 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`whitespace-nowrap rounded-2xl px-5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('filter_all' as any) || 'Todos'}
            </button>
            
            {CATEGORY_ORDER.map((catKey) => {
              const isActive = activeFilter === catKey;
              const uiInfo = CATEGORY_UI[catKey];
              // Usamos 'as any' para ignorar o erro do TypeScript em chaves dinâmicas
              const shortName = t(`cat_short_${catKey}` as any) || uiInfo.fallback;
              
              if (!categoryGroups[catKey] || categoryGroups[catKey].length === 0) return null;

              return (
                <button
                  key={catKey}
                  onClick={() => setActiveFilter(catKey)}
                  className={`whitespace-nowrap rounded-2xl px-5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="custom-scrollbar overflow-y-auto p-5 md:p-8"
          style={{ contain: 'paint layout', contentVisibility: 'auto' } as React.CSSProperties}
        >
          {categoriesToShow.map((catKey) => {
            const items = categoryGroups[catKey];
            if (!items || items.length === 0) return null;

            const ui = CATEGORY_UI[catKey] || CATEGORY_UI['other'];
            const Icon = ui.icon;

            return (
              <div key={catKey} className="mb-10 last:mb-0 animate-in fade-in duration-300">
                <div className="mb-4 ml-1 flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2 text-blue-500 shadow-sm border border-slate-100">
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">
                    {t(ui.key as any) || ui.fallback}
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                  {items.map((type) => (
                    <BlockItem
                      key={type}
                      type={type}
                      previewUrl={SECTION_PREVIEWS[type]}
                      t={t}
                      onClick={handleAddSection}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
});

AddSectionModal.displayName = 'AddSectionModal';