import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useBlocker } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslate } from '../context/LanguageContext';

import type { Section, SectionStyle, ModalType } from '../types/editor';
import { SectionLibrary, type SectionContent } from '../components/sections/main';
import { MAX_SECTIONS } from '../utils/maxSections';
import { 
  sectionHasPendingUploads, 
  sectionTotalPendingBytes, 
  cloneSections 
} from '../utils/sectionUtils';

import { DesktopSidebar } from '../components/editor/desktopSidebar';
import { EditorHeader } from '../components/editor/EditorHeader';
import { MobileElements } from '../components/editor/MobileElements';

// Novos componentes otimizados
import { EditorSection } from '../components/editor/EditorSection';
import { EditorEmptyState } from '../components/editor/EditorEmptyState';
import { EditorFab } from '../components/editor/EditorFab';
import { EditorModals } from '../components/editor/SecurityModal';

const MAX_TOTAL_SECTION_MEDIA_BYTES = 15 * 1024 * 1024;

export function Editor() {
  const [slugs, setSlugs] = useState<{ store: string; page: string } | null>(null);
  const { pageId } = useParams<{ pageId: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [originalSections, setOriginalSections] = useState<Section[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { t } = useTranslate();

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  // Ref essencial para saber se a seção clicada mudou ou é a mesma
  const lastFocusedIdRef = useRef<string | null>(null); 

  const hasChanges = useMemo(() => {
    return JSON.stringify(sections) !== JSON.stringify(originalSections);
  }, [sections, originalSections]);

  const hasPendingUploads = useMemo(() => {
    return sections.some(sectionHasPendingUploads);
  }, [sections]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (hasChanges || hasPendingUploads) &&
      currentLocation.pathname !== nextLocation.pathname
  );

  const isSectionVisible = useCallback((element: HTMLElement) => {
    const container = scrollAreaRef.current;
    if (!container) return true;

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const visibleTop = Math.max(elementRect.top, containerRect.top);
    const visibleBottom = Math.min(elementRect.bottom, containerRect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    const threshold = Math.min(elementRect.height * 0.8, containerRect.height * 0.4, 150);
    return visibleHeight >= threshold;
  }, []);

  // Lógica de FOCO otimizada conforme sua regra
  const focusSection = useCallback(
    (id: string) => {
      // Verifica se o usuário está trocando de secção ou clicando na mesma
      const isNewFocus = lastFocusedIdRef.current !== id;
      
      setEditingId(id);
      lastFocusedIdRef.current = id;

      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const element = document.getElementById(`section-${id}`);
        if (!element) return;

        // SE for a mesma secção que já estava selecionada E ela estiver visível, cancela o "puxão"
        if (!isNewFocus && isSectionVisible(element)) {
          return; 
        }

        // Caso contrário (é uma secção NOVA, ou é a mesma que saiu da visão), PUXA AO CENTRO.
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      });
    },
    [isSectionVisible]
  );

  const handleSetEditingId = useCallback(
    (id: string | null) => {
      if (id === null) {
        setEditingId(null);
        lastFocusedIdRef.current = null;
        return;
      }
      focusSection(id);
    },
    [focusSection]
  );

  // O uso cuidadoso de useEffects previne renders excessivos (CPU leak)
  useEffect(() => {
    return () => {
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges || hasPendingUploads) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, hasPendingUploads]);

  useEffect(() => {
    if (blocker.state === 'blocked') setActiveModal('NAVIGATION');
  }, [blocker.state]);

  // Carregamento inicial limpo (Uso mínimo da API do Supabase - Plano Free)
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      if (!pageId) return;

      try {
        setLoading(true);

        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('slug, store_id')
          .eq('id', pageId)
          .abortSignal(controller.signal)
          .single();

        if (pageError) throw pageError;

        if (pageData) {
          const { data: storeData, error: storeErr } = await supabase
            .from('stores')
            .select('slug')
            .eq('id', pageData.store_id)
            .abortSignal(controller.signal)
            .single();

          if (storeErr) throw storeErr;

          setSlugs({
            page: pageData.slug || pageId,
            store: storeData?.slug || pageData.store_id,
          });
        }

        const { data: sectionsData, error: secErr } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageId)
          .order('order_index', { ascending: true })
          .abortSignal(controller.signal);

        if (secErr) throw secErr;

        if (sectionsData) {
          const formatted: Section[] = sectionsData.map((item) => ({
            id: item.id,
            type: item.type as keyof typeof SectionLibrary,
            content: (item.content as SectionContent) || {},
            style: item.style || {
              cols: '1',
              theme: 'light',
              align: 'left',
              fontSize: 'base',
            },
          }));

          setSections(formatted);
          setOriginalSections(cloneSections(formatted));
          setLastSaved(new Date());
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Erro de carregamento:', err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [pageId]);

  const handleManualSave = useCallback(async () => {
    if (!pageId || isSaving) return;

    const problematicSections = sections.filter((section) => {
      return sectionHasPendingUploads(section) || sectionTotalPendingBytes(section) > MAX_TOTAL_SECTION_MEDIA_BYTES;
    });

    if (problematicSections.length > 0) {
      return toast.error(
        t('saveBlockedPendingSection', { section: problematicSections[0].type.toUpperCase() }) ||
          `Ação bloqueada: a secção possui uploads pendentes ou muito grandes.`,
        { duration: 5000 }
      );
    }

    setIsSaving(true);
    const loadingToast = toast.loading(t('savingPage') || 'Salvando página...');

    try {
      await supabase.from('page_sections').delete().eq('page_id', pageId);

      const toInsert = sections.map((s, i) => ({
        page_id: pageId,
        type: s.type,
        content: s.content,
        style: s.style,
        order_index: i,
      }));

      const { error } = await supabase.from('page_sections').insert(toInsert);
      if (error) throw error;

      setOriginalSections(cloneSections(sections));
      setLastSaved(new Date());
      setActiveModal(null);

      toast.success(t('publishedSuccess') || 'Publicado com sucesso!', { id: loadingToast });
      if (blocker.state === 'blocked') blocker.proceed();
    } catch (err: unknown) {
      console.error(err);
      toast.error(t('publishError') || 'Erro ao publicar.', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  }, [pageId, isSaving, sections, t, blocker]);

  const handleDiscard = useCallback(() => {
    setSections(cloneSections(originalSections));
    setActiveModal(null);
    if (blocker.state === 'blocked') blocker.proceed();
  }, [originalSections, blocker]);

  const updateSectionStyle = useCallback(
    (id: string, key: keyof SectionStyle, value: string) => {
      focusSection(id);
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, style: { ...s.style, [key]: value } } : s))
      );
    },
    [focusSection]
  );

  const updateSectionContent = useCallback((id: string, key: string, value: unknown) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, content: { ...sec.content, [key]: value } } : sec
      )
    );
  }, []);

  const handlePreview = useCallback(() => {
    if (slugs?.store) {
      const pagePath = slugs.page === 'home' ? '' : `/${slugs.page}`;
      window.open(`/${slugs.store}${pagePath}`, '_blank');
    } else {
      alert(t('waitingAddressesLoad') || 'Aguardando carregamento...');
    }
  }, [slugs, t]);

  const handleAddBlock = useCallback(() => {
    if (sections.length >= MAX_SECTIONS) {
      toast.error(
        <div className="flex flex-col gap-0.5">
          <b className="text-[11px] uppercase tracking-wider font-black">{t('editor_limit_reached')}</b>
          <p className="text-[10px] opacity-90 leading-tight">{t('editor_limit_advice')}</p>
        </div>,
        { duration: 5000, icon: '🚀', style: { borderRadius: '20px', padding: '12px 16px' } }
      );
      return;
    }
    setShowAddModal(true);
  }, [sections.length, t]);

  const activeSectionInfo = useMemo(() => sections.find((s) => s.id === editingId), [sections, editingId]);
  const activeSectionName = useMemo(() => {
    return activeSectionInfo?.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase() || t('blockDefaultName') || 'BLOCO';
  }, [activeSectionInfo, t]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white italic tracking-widest text-slate-400 uppercase text-xs">
        {t('loadingEditor')}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F1F5F9] flex flex-col md:flex-row overflow-hidden font-sans">
      <DesktopSidebar
        sections={sections}
        hasChanges={hasChanges}
        lastSaved={lastSaved}
        editingId={editingId}
        isSaving={isSaving}
        setEditingId={handleSetEditingId}
        updateSectionStyle={updateSectionStyle}
        setSections={setSections}
        setShowAddModal={setShowAddModal}
        setActiveModal={setActiveModal}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <EditorHeader
          hasChanges={hasChanges}
          isSaving={isSaving}
          setEditingId={handleSetEditingId}
          setShowMobileSidebar={setShowMobileSidebar}
          handlePreview={handlePreview}
          setActiveModal={setActiveModal}
        />

        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto p-0 flex flex-col items-center bg-slate-100/50"
          onClick={() => {
            if (!showMobileSidebar && window.innerWidth >= 768) {
              handleSetEditingId(null);
            }
          }}
        >
          {sections.length === 0 && (
             <EditorEmptyState onAdd={() => setShowAddModal(true)}   t={t as (key: string) => string}
              />
          )}

          <div className="bg-white min-h-full w-full relative z-10">
            {sections.map((s) => {
              const isActive = editingId === s.id;
              const hasActiveSelection = editingId !== null;
              const isInactive = hasActiveSelection && !isActive;

              return (
                <EditorSection
                  key={s.id}
                  section={s}
                  isActive={isActive}
                  isInactive={isInactive}
                  onClick={focusSection}
                  onUpdateContent={updateSectionContent}
                  t={t as (key: string) => string}
            />
              );
            })}
          </div>
        </div>

        <MobileElements
          editingId={editingId}
          showMobileSidebar={showMobileSidebar}
          activeSectionName={activeSectionName}
          sections={sections}
          hasChanges={hasChanges}
          setShowMobileSidebar={setShowMobileSidebar}
          setEditingId={handleSetEditingId}
          updateSectionStyle={updateSectionStyle}
          setSections={setSections}
          setShowAddModal={setShowAddModal}
          setActiveModal={setActiveModal}
        />

        <EditorFab onAdd={handleAddBlock} isDisabled={sections.length >= MAX_SECTIONS} />
      </main>

      <EditorModals
        sections={sections}
        activeModal={activeModal}
        showAddModal={showAddModal}
        isSaving={isSaving}
        hasPendingUploads={hasPendingUploads}
        setActiveModal={setActiveModal}
        setShowAddModal={setShowAddModal}
        handleManualSave={handleManualSave}
        handleDiscard={handleDiscard}
        resetBlocker={() => blocker.reset?.()}
        setSections={setSections}
        setEditingId={handleSetEditingId}
        setShowMobileSidebar={setShowMobileSidebar}
      />
    </div>
  );
}