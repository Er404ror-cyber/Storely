import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useBlocker } from 'react-router-dom';
import { Plus, Layout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SectionLibrary, type SectionContent } from '../components/sections/main';
import { toast } from 'react-hot-toast';
import { useTranslate } from '../context/LanguageContext';

import type { Section, SectionStyle, ModalType } from '../types/editor';
import { MAX_SECTIONS } from '../utils/maxSections';
import { DesktopSidebar } from '../components/editor/desktopSidebar';
import { EditorHeader } from '../components/editor/EditorHeader';
import { MobileElements } from '../components/editor/MobileElements';
import { EditorModals } from '../components/editor/SecurityModal';

const MAX_TOTAL_SECTION_MEDIA_BYTES = 15 * 1024 * 1024;

function getSectionPendingItems(section: Section) {
  const content = (section.content || {}) as any;

  const images = Array.isArray(content.images) ? content.images : [];
  const media = content.media ? [content.media] : [];
  const singleImagePending = content.pendingImage ? [content.pendingImage] : [];

  return [...images, ...media, ...singleImagePending].filter(Boolean);
}

function sectionHasPendingUploads(section: Section) {
  return getSectionPendingItems(section).some((item: any) => item?.isTemp);
}

function sectionTotalPendingBytes(section: Section) {
  return getSectionPendingItems(section).reduce(
    (acc: number, item: any) => acc + (item?.size || 0),
    0
  );
}

function cloneSections<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

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
  const lastFocusedIdRef = useRef<string | null>(null);
  const scrollRafRef = useRef<number | null>(null);

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

    const visibleTop = elementRect.top >= containerRect.top + 24;
    const visibleBottom = elementRect.bottom <= containerRect.bottom - 24;

    return visibleTop && visibleBottom;
  }, []);

  const focusSection = useCallback(
    (id: string, force = false) => {
      setEditingId((prev) => (prev === id ? prev : id));

      if (!force && lastFocusedIdRef.current === id) {
        const existing = document.getElementById(`section-${id}`);
        if (existing && isSectionVisible(existing)) return;
      }

      lastFocusedIdRef.current = id;

      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }

      scrollRafRef.current = window.requestAnimationFrame(() => {
        const element = document.getElementById(`section-${id}`);
        if (!element) return;

        if (!force && isSectionVisible(element)) return;

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
        lastFocusedIdRef.current = null;
        setEditingId(null);
        return;
      }

      focusSection(id, false);
    },
    [focusSection]
  );

  useEffect(() => {
    return () => {
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
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

          const snapshot = cloneSections(formatted);

          setSections(formatted);
          setOriginalSections(snapshot);
          setLastSaved(new Date());
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === 'AbortError' || err.message.includes('aborted')) return;
          console.error('Erro real de carregamento:', err.message);
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
      const hasTemp = sectionHasPendingUploads(section);
      const totalBytes = sectionTotalPendingBytes(section);
      const isHeavy = totalBytes > MAX_TOTAL_SECTION_MEDIA_BYTES;

      return hasTemp || isHeavy;
    });

    if (problematicSections.length > 0) {
      const firstErrorType = problematicSections[0].type.toUpperCase();

      return toast.error(
        t('saveBlockedPendingSection', { section: firstErrorType }) ||
          `Ação bloqueada: a secção ${firstErrorType} possui uploads pendentes ou muito grandes.`,
        {
          id: 'save-blocked',
          duration: 5000,
        }
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

      const snapshot = cloneSections(sections);

      setOriginalSections(snapshot);
      setLastSaved(new Date());
      setActiveModal(null);

      toast.success(t('publishedSuccess') || 'Publicado com sucesso!', {
        id: loadingToast,
      });

      if (blocker.state === 'blocked') blocker.proceed();
    } catch (err: unknown) {
      console.error(err);
      toast.error(t('publishError') || 'Erro ao publicar.', {
        id: loadingToast,
      });
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
      focusSection(id, false);

      setSections((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, style: { ...s.style, [key]: value } } : s
        )
      );
    },
    [focusSection]
  );

  const updateSectionContent = useCallback(
    (id: string, key: string, value: unknown) => {
      setSections((prev) =>
        prev.map((sec) =>
          sec.id === id
            ? {
                ...sec,
                content: {
                  ...sec.content,
                  [key]: value,
                },
              }
            : sec
        )
      );
    },
    []
  );

  const handlePreview = useCallback(() => {
    if (slugs?.store) {
      const pagePath = slugs.page === 'home' ? '' : `/${slugs.page}`;
      const url = `/${slugs.store}${pagePath}`;
      window.open(url, '_blank');
    } else {
      alert(t('waitingAddressesLoad') || 'Aguardando carregamento dos endereços...');
    }
  }, [slugs, t]);

  const handleAddBlock = useCallback(() => {
    if (sections.length >= MAX_SECTIONS) {
      toast.error(
        <div className="flex flex-col gap-0.5">
          <b className="text-[11px] uppercase tracking-wider leading-none font-black">
            {t('editor_limit_reached')}
          </b>
          <p className="text-[10px] opacity-90 leading-tight">
            {t('editor_limit_advice')}
          </p>
        </div>,
        {
          id: 'limit-reached',
          duration: 5000,
          icon: '🚀',
          style: { borderRadius: '20px', padding: '12px 16px' },
        }
      );
      return;
    }

    setShowAddModal(true);
  }, [sections.length, t]);

  const activeSectionInfo = useMemo(
    () => sections.find((s) => s.id === editingId),
    [sections, editingId]
  );

  const activeSectionName = useMemo(() => {
    return (
      activeSectionInfo?.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase() ||
      t('blockDefaultName') ||
      'BLOCO'
    );
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
            <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px] w-full animate-in fade-in duration-300">
              <div className="relative mb-8 cursor-pointer" onClick={() => setShowAddModal(true)}>
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-slate-200">
                  <Layout size={48} className="text-slate-400 md:size-64" />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md border-4 border-white">
                    <Plus size={20} strokeWidth={3} />
                  </div>
                </div>
              </div>

              <div className="max-w-md text-center space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
                  {t('empty_state_title')}
                </h2>

                <p className="text-sm md:text-base text-slate-500 leading-relaxed px-4">
                  {t('empty_state_description')}
                </p>

                <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <span className="h-px w-8 bg-slate-200" />
                  <span className="flex items-center gap-1.5">{t('empty_state_action')}</span>
                  <span className="h-px w-8 bg-slate-200" />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white min-h-full w-full relative z-10">
            {sections.map((s) => {
              const Comp = SectionLibrary[s.type];
              if (!Comp) return null;

              const isActive = editingId === s.id;
              const hasActiveSelection = editingId !== null;
              const isInactive = hasActiveSelection && !isActive;

              return (
                <section
                  id={`section-${s.id}`}
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editingId !== s.id) focusSection(s.id, true);
                  }}
                  className={[
                    'group relative cursor-pointer border-b border-slate-200/80 transition-all duration-200',
                    isActive
                      ? 'z-20 opacity-100 ring-2 ring-blue-500 ring-inset border-blue-300 bg-blue-50/40 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]'
                      : '',
                    isInactive ? 'opacity-100' : '',
                  ].join(' ')}
                  style={{
                    textAlign: s.style.align,
                    fontSize:
                      s.style.fontSize === 'small'
                        ? '0.85rem'
                        : s.style.fontSize === 'large'
                          ? '1.2rem'
                          : '1rem',
                  }}
                >
                  {!isActive && isInactive && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center px-4">
                      <div className="hidden md:flex flex-col items-center gap-2 rounded-2xl bg-white border border-slate-200 shadow-sm px-5 py-3 text-center max-w-sm">
                        <span className="text-sm font-bold text-slate-800">
                          {t('clickToEdit')}
                        </span>
                        <span className="text-xs text-slate-500 leading-relaxed">
                          {t('clickToEditHint')}
                        </span>
                      </div>

                      <div className="md:hidden flex flex-col items-center gap-2 rounded-2xl bg-slate-900 shadow-sm px-4 py-3 text-center max-w-[92%]">
                        <span className="text-sm font-bold text-white">
                          {t('tapToEdit')}
                        </span>
                        <span className="text-[11px] text-white/85 leading-relaxed">
                          {t('tapToEditHint')}
                        </span>
                      </div>
                    </div>
                  )}

                  {!isActive && !hasActiveSelection && (
                    <>
                      <div className="hidden md:flex absolute top-3 right-3 z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {t('clickToEdit')}
                        </span>
                      </div>

                      <div className="md:hidden absolute top-2 right-2 z-20 pointer-events-none">
                        <span className="px-2 py-1 rounded-full bg-slate-900/75 text-white text-[9px] font-semibold shadow-sm">
                          {t('tapToEdit')}
                        </span>
                      </div>
                    </>
                  )}

                  {isActive && (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 z-20" />

                      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wide shadow-sm">
                          {t('editingSection')}
                        </span>
                      </div>

                      <div className="md:hidden absolute left-3 right-3 bottom-3 z-20 pointer-events-none">
                        <div className="rounded-2xl bg-white border border-blue-200 shadow-sm px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-slate-800">
                            {t('mobileCustomizeCardHint')}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div
                    className={`w-full overflow-hidden transition-[opacity,transform,filter] duration-200 ${
                      s.style.theme === 'dark'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-900'
                    } ${
                      isActive
                        ? 'min-h-[320px] md:min-h-[380px]'
                        : 'min-h-[260px] md:min-h-[320px]'
                    }`}
                  >
                    <div
                      className={`transition-[opacity,transform,filter] duration-200 ${
                        isInactive
                          ? 'opacity-25  saturate-50 scale-[0.985] pointer-events-none select-none'
                          : 'opacity-100  saturate-100 scale-100'
                      }`}
                    >
                      <Comp
                        content={s.content}
                        style={s.style}
                        onUpdate={(k: string, v: unknown) =>
                          updateSectionContent(s.id, k, v)
                        }
                      />
                    </div>
                  </div>
                </section>
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

        <button
          onClick={handleAddBlock}
          className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform ${
            sections.length >= MAX_SECTIONS
              ? 'bg-slate-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus
            size={36}
            className={sections.length >= MAX_SECTIONS ? 'text-slate-400' : 'text-white'}
          />
        </button>
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