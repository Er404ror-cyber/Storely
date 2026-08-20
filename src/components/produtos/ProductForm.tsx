import { memo, useCallback } from 'react';
import { Package2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Adicionado para dar os alertas visuais
import { useTranslate } from '../../context/LanguageContext';
import { useProductForm } from './ProductForm/useProductForm';
import { ProductImageGallery } from './ProductForm/ProductImageGallery';
import { ProductBasicDetails } from './ProductForm/ProductBasicDetails';
import { ProductActionBar } from './ProductForm/ProductActionBar';

export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  unit: string;
  full_description: string;
  main_image: string;
  gallery: string[];
  discount_percent?: string;
}

interface ProductFormProps {
  productId?: string;
  isCreating?: boolean;
  initialData: ProductFormData;
  onCancel?: () => void;
  onSuccess?: (updatedProduct?: Record<string, unknown> | null) => void;
}

export const ProductForm = memo(function ProductForm(props: ProductFormProps) {
  const { t } = useTranslate();
  const state = useProductForm(props);

  // NOVA BARREIRA DE SALVAMENTO: Interceta o clique e lança os alertas
  const handleSaveClick = useCallback(() => {
    if (state.saveMutation.isPending || state.isSyncingPhotos || state.isCancelling) return;

    // Bloqueia imagens quebradas pela UI ou locais sem ficheiro
    const hasBrokenImages = state.hasOrphanBlobs || state.slots.some(s => Boolean(s.error));

    if (hasBrokenImages) {
      toast.error(t('product_form_orphan_blob_prevent_save', { 
        defaultValue: 'Não é possível guardar. Substitua as fotos danificadas (a vermelho) primeiro.' 
      }), { duration: 5000 });
      return; // CORTA AQUI, NÃO SALVA!
    }

    // Bloqueia imagens pendentes
    if (state.hasPendingUploads || state.hasAnyLocalBlob) {
      toast.error(t('product_form_blobs_prevent_save', { 
        defaultValue: 'Existem fotos pendentes. Sincronize as fotos antes de salvar.' 
      }), { duration: 5000 });
      return; // CORTA AQUI, NÃO SALVA!
    }

    // Bloqueia por falta de campos (Nome, Preço, etc)
    if (!state.canSave) {
      const errors = Object.values(state.fieldErrors).filter(Boolean);
      if (errors.length > 0) {
        toast.error(errors[0], { duration: 4000 });
      } else {
        toast.error('Preencha todos os campos obrigatórios.');
      }
      return; // CORTA AQUI, NÃO SALVA!
    }

    // Se chegou até aqui sem retornar, é porque ESTÁ TUDO PERFEITO! Guarda na Base de Dados.
    state.saveMutation.mutate();
  }, [state, t]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-40">
      
      {/* CABEÇALHO */}
      <div className="mb-2 flex items-start gap-3 px-2">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Package2 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
            {props.isCreating ? t('product_form_create_title') : t('product_form_edit_title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t('product_form_intro')}</p>
        </div>
      </div>

      {/* GALERIA */}
      <ProductImageGallery
        slots={state.slots}
        visibleCount={state.visibleCount}
        onAddMore={() => state.setVisibleCount(v => Math.min(5, v + 1))}
        onFileSelect={state.handleFileSelect}
        onRemovePhoto={state.removePhoto}
        onSyncPhotos={state.handleSyncPhotos}
        isSyncingPhotos={state.isSyncingPhotos}
        hasPendingUploads={state.hasPendingUploads}
        hasOrphanBlobs={state.hasOrphanBlobs} 
        onImageError={state.handleImageError} 
      />

      {/* DADOS BÁSICOS */}
      <ProductBasicDetails
        formData={state.formData}
        setFormData={state.setFormData}
        priceMajor={state.priceMajor}
        setPriceMajor={state.setPriceMajor}
        priceCents={state.priceCents}
        setPriceCents={state.setPriceCents}
        fieldErrors={state.fieldErrors}
        adminStoreId={state.adminStore?.id}
      />

      {/* BARRA FIXA DE AÇÃO COM ESTADOS DE PROCESSAMENTO E CANCELAMENTO */}
      <ProductActionBar
        isCreating={!!props.isCreating}
        hasAnyLocalBlob={state.hasAnyLocalBlob}
        hasPendingUploads={state.hasPendingUploads}
        hasOrphanBlobs={state.hasOrphanBlobs}
        isSyncingPhotos={state.isSyncingPhotos}
        isSaving={state.saveMutation.isPending}
        isCancelling={state.isCancelling}
        canSave={true} // UX: Forçamos a true para o clique ser permitido e a função handleSaveClick poder disparar o Toast de Erro.
        fieldErrors={state.fieldErrors}
        onSave={handleSaveClick} // <---- MUDANÇA AQUI! Estava direto no mutate, agora passa pelo nosso segurança.
        onCancel={state.handleCancel}
      />
    </div>
  );
});