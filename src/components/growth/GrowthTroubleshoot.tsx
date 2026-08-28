import { memo } from 'react';
import { Lightbulb, TrendingDown, Eye, MessageCircle } from 'lucide-react';

interface Props {
  t: (k: string) => string;
}

export const GrowthTroubleshoot = memo(function GrowthTroubleshoot({ t }: Props) {
  return (
    <section 
      className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200 space-y-3.5"
      style={{ contain: 'content' }}
    >
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-amber-500 shrink-0" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {t('guide_troubleshoot_title') || 'Dicas Rápidas de Conversão'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Dica 1: Conversão / Preços */}
        <div 
          className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex flex-col justify-between space-y-2"
          style={{ contain: 'paint' }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <TrendingDown size={14} className="text-amber-600 shrink-0" />
              <span className="truncate">
                {t('guide_troubleshoot_p1_title') || 'Muitas visitas e poucos pedidos?'}
              </span>
            </div>
            <p className="text-[11.5px] text-amber-950/80 leading-relaxed font-normal break-words">
              {t('guide_troubleshoot_p1_desc') || 'Envie sempre o link /products direto para o cliente não precisar esperar para ver fotos e preços.'}
            </p>
          </div>
        </div>

        {/* Dica 2: Tráfego / Bio */}
        <div 
          className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 flex flex-col justify-between space-y-2"
          style={{ contain: 'paint' }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Eye size={14} className="text-indigo-600 shrink-0" />
              <span className="truncate">
                {t('guide_troubleshoot_p2_title') || 'Poucas visitas na loja?'}
              </span>
            </div>
            <p className="text-[11.5px] text-indigo-950/80 leading-relaxed font-normal break-words">
              {t('guide_troubleshoot_p2_desc') || 'Fixe o link na bio do Instagram e partilhe nos Stories pelo menos 3 vezes por semana com sticker de link.'}
            </p>
          </div>
        </div>

        {/* Dica 3: Resposta Rápida WhatsApp */}
        <div 
          className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex flex-col justify-between space-y-2"
          style={{ contain: 'paint' }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <MessageCircle size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate">
                {t('guide_troubleshoot_p3_title') || 'Clientes desistem no WhatsApp?'}
              </span>
            </div>
            <p className="text-[11.5px] text-emerald-950/80 leading-relaxed font-normal break-words">
              {t('guide_troubleshoot_p3_desc') || 'Responda nos primeiros minutos com a saudação automática para fechar o pedido enquanto o cliente tem interesse.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

GrowthTroubleshoot.displayName = 'GrowthTroubleshoot';