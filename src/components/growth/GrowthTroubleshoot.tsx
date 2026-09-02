import { memo } from 'react';
import { Lightbulb, Send, Instagram, MessageCircle } from 'lucide-react';

interface Props {
  t: (k: string) => string;
}

export const GrowthTroubleshoot = memo(function GrowthTroubleshoot({ t }: Props) {
  return (
    <section 
      className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-3.5"
      style={{ contain: 'content' }}
    >
      <div className="flex items-center gap-1.5">
        <Lightbulb size={16} className="text-amber-500 shrink-0" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          {t('guide_troubleshoot_title') || 'O que fazer no dia a dia'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Situação 1 */}
        <div 
          className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between space-y-1.5"
          style={{ contain: 'paint' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Send size={13} />
            </div>
            <span className="text-xs font-bold text-zinc-900 leading-tight">
              {t('guide_troubleshoot_p1_title') || 'Quando o cliente pedir preços'}
            </span>
          </div>
          <p className="text-[12px] text-zinc-600 leading-relaxed font-normal">
            {t('guide_troubleshoot_p1_desc') || 'Não perca tempo a escrever item por item. Envie o link do catálogo para ele escolher com fotos e valores.'}
          </p>
        </div>

        {/* Situação 2 */}
        <div 
          className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between space-y-1.5"
          style={{ contain: 'paint' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
              <Instagram size={13} />
            </div>
            <span className="text-xs font-bold text-zinc-900 leading-tight">
              {t('guide_troubleshoot_p2_title') || 'Para receber mais mensagens'}
            </span>
          </div>
          <p className="text-[12px] text-zinc-600 leading-relaxed font-normal">
            {t('guide_troubleshoot_p2_desc') || 'Coloque o link no seu perfil do Instagram e poste nos Stories dizendo: "link na bio para ver os produtos".'}
          </p>
        </div>

        {/* Situação 3 */}
        <div 
          className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between space-y-1.5"
          style={{ contain: 'paint' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageCircle size={13} />
            </div>
            <span className="text-xs font-bold text-zinc-900 leading-tight">
              {t('guide_troubleshoot_p3_title') || 'Para não perder vendas à noite'}
            </span>
          </div>
          <p className="text-[12px] text-zinc-600 leading-relaxed font-normal">
            {t('guide_troubleshoot_p3_desc') || 'Use a mensagem automática de saudação do WhatsApp. Assim, quem mandar mensagem já recebe a vitrine na hora.'}
          </p>
        </div>
      </div>
    </section>
  );
});

GrowthTroubleshoot.displayName = 'GrowthTroubleshoot';