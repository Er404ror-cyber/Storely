import { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  t: (k: string) => string;
}

export const GrowthTroubleshoot = memo(function GrowthTroubleshoot({ t }: Props) {
  return (
    <section className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200/80 space-y-3 shadow-2xs">
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {t('guide_troubleshoot_title') || 'Dicas Rápidas de Conversão'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
            <span className="truncate">{t('guide_troubleshoot_p1_title') || 'Muitas visitas e poucos pedidos?'}</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed break-words">
            {t('guide_troubleshoot_p1_desc') || 'Envie sempre o link /products direto para o cliente não precisar esperar para ver preços.'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
            <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
            <span className="truncate">{t('guide_troubleshoot_p2_title') || 'Poucas visitas?'}</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed break-words">
            {t('guide_troubleshoot_p2_desc') || 'Fixe o link na bio e partilhe nos Stories pelo menos 3 vezes por semana com sticker de link.'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <span className="truncate">{t('guide_troubleshoot_p3_title') || 'Clientes desistem no WhatsApp?'}</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed break-words">
            {t('guide_troubleshoot_p3_desc') || 'Responda nos primeiros minutos com a saudação automática para fechar o pedido enquanto o cliente tem interesse.'}
          </p>
        </div>
      </div>
    </section>
  );
});