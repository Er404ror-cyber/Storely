import { memo } from 'react';
import { Flame, MessageCircle, Check, Copy } from 'lucide-react';

interface TemplateItem {
  titleKey: string;
  badge: string;
  targetRoute: string;
  badgeStyle: string;
  text: string;
}

interface Props {
  templates: TemplateItem[];
  copiedIdx: number | null;
  onCopy: (text: string, idx: number) => void;
  onShareWhatsApp: (text: string) => void;
  t: (k: string) => string;
}

export const GrowthTemplates = memo(function GrowthTemplates({
  templates,
  copiedIdx,
  onCopy,
  onShareWhatsApp,
  t
}: Props) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Flame size={18} className="text-amber-500 shrink-0" />
          <span>{t('guide_templates_title') || 'Mensagens Prontas para Enviar'}</span>
        </h2>
        <p className="text-xs text-zinc-500">{t('guide_templates_sub') || 'Copie textos já testados que convencem clientes a clicar e comprar:'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((item, idx) => (
          <div key={idx} className="p-4 rounded-3xl bg-white border border-zinc-200/80 flex flex-col justify-between space-y-3.5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border truncate ${item.badgeStyle}`}>
                  {item.badge}
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-500 shrink-0">
                  {item.targetRoute}
                </span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line font-medium break-words">
                {item.text}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => onShareWhatsApp(item.text)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 shadow-2xs active:scale-95 cursor-pointer"
              >
                <MessageCircle size={13} className="text-emerald-600" />
                <span>Enviar no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => onCopy(item.text, idx)}
                className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-2xs active:scale-95 cursor-pointer"
                title={t('guide_copy_msg') || 'Copiar Texto'}
              >
                {copiedIdx === idx ? <Check size={14} className="text-emerald-600" strokeWidth={2.5} /> : <Copy size={14} className="text-zinc-500" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});