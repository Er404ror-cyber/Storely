import { memo, useState, useMemo } from 'react';
import { 
  Music4, 
  ChevronDown, 
  Link as LinkIcon, 
  ExternalLink, 
  PauseCircle, 
  Play, 
  Scissors, 
  Trash2, 
  Loader2,
  Volume2
} from 'lucide-react';
import { type AudioSectionProps } from '../../../../types/storeTabAudio';

const formatSeconds = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const mins = Math.floor(value / 60);
  const secs = Math.floor(value % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

interface ExtendedAudioProps extends AudioSectionProps {
  onTogglePublicStatus?: (status: boolean) => Promise<void>;
}

export const AudioSection = memo(function AudioSection({
  isEditing,
  setIsEditing,
  audioFileInputRef,
  audioUrl,
  audioFileName,
  audioEnabled,
  audioStartAt,
  audioEndAt,
  isPreviewPlaying,
  isUploadingAudio,
  isPendingDelete,
  hasAudioReady,
  selectedAudioFile,
  audioTooLarge,
  rangeMax,
  clipLength,
  displayedAudioDuration,
  onAudioFilePick,
  togglePreviewPlayback,
  onChangeStartAt,
  onRemoveSavedAudio,
  onCancel,
  onDeletePending,
  onSave,
  t,
  AUDIO_ACCEPT,
  helpLinks,
  onTogglePublicStatus,
}: ExtendedAudioProps) {
  
  const [spamLock, setSpamLock] = useState(false);
  const canShowPublicToggle = !!audioUrl;

  const isPt = useMemo(() => {
    try { return t('cancel').toLowerCase() === 'cancelar' || navigator.language.startsWith('pt'); }
    catch { return true; }
  }, [t]);

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (spamLock || !onTogglePublicStatus) return;
    setSpamLock(true);
    await onTogglePublicStatus(e.target.checked);
    setTimeout(() => setSpamLock(false), 1200);
  };

  return (
    <div className="bg-slate-50/30 p-4 sm:p-6 md:p-8 max-w-full overflow-hidden">
      <div className="flex flex-col gap-4">
        
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="group flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:border-indigo-200 transition-all cursor-pointer"
        >
          <div className="shrink-0 rounded-xl bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Music4 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              {t('store_music_title') || (isPt ? 'Música de Fundo' : 'Background Music')}
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-800">
              {audioFileName || (isPt ? 'Nenhuma faixa selecionada' : 'No track selected')}
            </p>
            <div className="mt-2 flex max-w-full flex-wrap gap-2 overflow-hidden">
              <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${audioEnabled && audioUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {audioEnabled && audioUrl 
                  ? (t('store_music_status_on') || (isPt ? 'Ativo' : 'Active')) 
                  : (t('store_music_status_off') || (isPt ? 'Inativo' : 'Inactive'))}
              </span>
              {audioUrl && (
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-violet-600 font-mono">
                  {formatSeconds(audioStartAt)} - {formatSeconds(audioEndAt)}
                </span>
              )}
            </div>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isEditing ? 'rotate-180' : ''}`} />
        </button>

        {isEditing && (
          <div className="space-y-5 rounded-2xl border border-indigo-100 bg-white p-4 sm:p-6 shadow-sm animate-in fade-in duration-200">
            <input ref={audioFileInputRef} type="file" accept={AUDIO_ACCEPT} onChange={onAudioFilePick} className="hidden" />

            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => audioFileInputRef.current?.click()} className="rounded-xl bg-indigo-600 px-4 py-3.5 text-[10px] font-black uppercase text-white hover:bg-slate-900 transition-colors cursor-pointer text-center">
                {audioUrl ? (t('store_music_step') || (isPt ? 'Substituir Áudio' : 'Replace Audio')) : (t('store_music_choose_file') || (isPt ? 'Escolher Ficheiro' : 'Choose File'))}
              </button>
              <a href={helpLinks.musicDownloadWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[10px] font-black uppercase text-slate-700 hover:border-indigo-300 transition-colors text-center">
                <LinkIcon size={12} /> {t('store_music_external_link') || (isPt ? 'Baixar Músicas' : 'Download Music')} <ExternalLink size={11} />
              </a>
            </div>

            {audioTooLarge && (
              <a href={helpLinks.compressAudio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase text-indigo-600 hover:underline w-full justify-center sm:justify-start">
                {t('store_music_compress_link') || (isPt ? 'Comprimir Ficheiro de Áudio' : 'Compress Audio File')} <ExternalLink size={11} />
              </a>
            )}

            {audioUrl ? (
              <>
                <button type="button" onClick={togglePreviewPlayback} className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[10px] font-black uppercase text-white transition-all cursor-pointer ${isPreviewPlaying ? 'bg-emerald-600 shadow-md ring-2 ring-emerald-100' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  {isPreviewPlaying ? <PauseCircle size={14} /> : <Play size={14} />}
                  {isPreviewPlaying ? (t('store_music_now_playing') || (isPt ? 'A Reproduzir' : 'Now Playing')) : (t('store_music_play_preview') || (isPt ? 'Ouvir Prévia' : 'Play Preview'))}
                </button>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm animate-in fade-in duration-300">
                  <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                      <Scissors size={12} /> {t('store_music_clip_range') || (isPt ? 'Intervalo de Reprodução' : 'Clip Playback Range')}
                    </label>
                    <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black text-white self-start sm:self-auto font-mono">
                      {formatSeconds(audioStartAt)} - {formatSeconds(audioEndAt)}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={rangeMax} 
                    step={0.1} 
                    value={audioStartAt} 
                    onChange={(e) => onChangeStartAt(Number(e.target.value))} 
                    className="w-full cursor-pointer accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none transition-all" 
                  />
                  <div className="mt-3 flex gap-4 text-[10px] font-bold text-slate-400">
                    <span>{t('store_music_total') || (isPt ? 'Total' : 'Total')}: <span className="font-mono text-slate-500">{formatSeconds(displayedAudioDuration)}</span></span>
                    <span>{t('store_music_clip_length') || (isPt ? 'Duração do Corte' : 'Clip Length')}: <span className="font-mono text-indigo-600">{formatSeconds(clipLength)}</span></span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-b border-slate-100 py-4">
                  <div className="flex flex-col gap-1.5 rounded-xl border border-indigo-50 bg-indigo-50/20 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      {t('store_music_step_2') || (isPt ? 'Configuração do Áudio' : 'Audio Setup Guide')}
                    </p>
                    <p className="text-xs font-medium text-slate-500 tracking-tight leading-relaxed">
                      {t('store_music_select_part_help') || (isPt 
                        ? 'A faixa completa foi importada de forma virtual. O som tocará de forma suave no teu site público assim que os utilizadores fizerem scroll na página.' 
                        : 'The full track has been virtually imported. The sound will trigger smoothly on your public store as soon as users start scrolling the page.')}
                    </p>
                    <div className="inline-flex items-center gap-1.5 self-start rounded-lg bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-700 mt-1">
                      <Volume2 size={11} />
                      {t('store_music_volume_hint') || (isPt ? 'Volume Automático Corrigido para:' : 'Auto Fixed Volume at:')} 5%
                    </div>
                  </div>

                  {canShowPublicToggle && onTogglePublicStatus && (
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-3 shadow-sm transition-all">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-700 truncate">
                          {t('store_music_enabled') || (isPt ? 'Ativar música para o público' : 'Enable music for the public')}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 truncate">
                          {audioEnabled 
                            ? (t('store_music_disable_hint') || (isPt ? 'A tocar no teu site público.' : 'Playing on your live store.')) 
                            : (t('store_music_enable_public_inactive') || (isPt ? 'Música em modo privado.' : 'Music in private mode.'))
                          }
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center shrink-0 select-none">
                        <input
                          type="checkbox"
                          checked={audioEnabled}
                          disabled={spamLock}
                          onChange={handleCheckboxChange}
                          className="peer sr-only"
                        />
                        <div className={`peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none ${spamLock ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                      </label>
                    </div>
                  )}
                </div>

                <button type="button" onClick={onRemoveSavedAudio} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-[10px] font-black uppercase text-red-600 hover:bg-red-100 transition-colors cursor-pointer">
                  <Trash2 size={12} /> {t('store_music_clear') || (isPt ? 'Eliminar Áudio' : 'Clear Audio')}
                </button>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                <Music4 className="mx-auto text-slate-300" size={28} />
                <p className="mt-2 text-xs font-black text-slate-500">{t('store_music_empty') || (isPt ? 'Sem música configurada' : 'No music setup yet')}</p>
                <p className="mt-1 text-[10px] text-slate-400">{t('store_music_empty_help') || (isPt ? 'Adicione um ficheiro de áudio leve de fundo.' : 'Add a lightweight background audio track.')}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-slate-100 pt-4">
              <button type="button" onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 cursor-pointer text-center">{t('cancel')}</button>
              {isPendingDelete && (
                <button type="button" onClick={onDeletePending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-[10px] font-black uppercase text-amber-700 cursor-pointer text-center">
                  <Trash2 size={12} /> {t('store_music_delete_pending') || (isPt ? 'Limpar ficheiro órfão' : 'Clear orphan file')}
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={Boolean(isUploadingAudio || (selectedAudioFile && !hasAudioReady))}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[10px] font-black uppercase text-white shadow-md shadow-indigo-100 disabled:opacity-40 cursor-pointer text-center min-w-[80px]"
              >
                {isUploadingAudio ? <Loader2 size={12} className="mx-auto animate-spin" /> : selectedAudioFile ? (t('store_music_save_clip') || (isPt ? 'Guardar Corte' : 'Save Clip')) : t('save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

AudioSection.displayName = 'AudioSection';