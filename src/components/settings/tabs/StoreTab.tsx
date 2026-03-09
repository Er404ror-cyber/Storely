import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Smartphone } from 'lucide-react';
import { useTranslate } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import { notify } from '../../../utils/toast';
import { EditableRow, SectionInfo } from '../AdminSettingsComponents';

export function StoreTab({ store }: { store: any }) {
  const { t } = useTranslate();
  const queryClient = useQueryClient();

  const updateField = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: string }) => {
      const { error } = await supabase.from("stores").update({ [field]: value }).eq("id", store?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
      notify.success(t('save_success'));
    },
    onError: (err: Error) => notify.error(err.message)
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4">
      <SectionInfo title={t('section_presence_title')} subtitle={t('section_presence_subtitle')} />
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden divide-y divide-slate-50">
        <EditableRow label={t('label_brand_name')} value={store?.name} onSave={(v) => updateField.mutate({ field: 'name', value: v })} />
        <EditableRow label={t('label_slug')} value={store?.slug} icon={<Globe size={16}/>} onSave={(v) => updateField.mutate({ field: 'slug', value: v.toLowerCase().trim() })} />
        <EditableRow label={t('label_description')} value={store?.description} isTextArea onSave={(v) => updateField.mutate({ field: 'description', value: v })} />
        <EditableRow label={t('label_whatsapp')} value={store?.whatsapp_number} icon={<Smartphone size={16}/>} onSave={(v) => updateField.mutate({ field: 'whatsapp_number', value: v })} />
      </div>
    </div>
  );
}