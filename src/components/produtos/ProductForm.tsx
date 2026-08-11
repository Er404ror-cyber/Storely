import { memo } from 'react';

import { Package2 } from 'lucide-react';
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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-40">
      
      {/* CABEÇALHO */}
      <div className="mb-2 flex items-start gap-3 px-2">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Package2 size={18} /></div>
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

      {/* BARRA FIXA DE AÇÃO */}
      <ProductActionBar
        isCreating={!!props.isCreating}
        hasAnyLocalBlob={state.hasAnyLocalBlob}
        hasPendingUploads={state.hasPendingUploads}
        hasOrphanBlobs={state.hasOrphanBlobs}
        isSyncingPhotos={state.isSyncingPhotos}
        isSaving={state.saveMutation.isPending}
        canSave={state.canSave}
        fieldErrors={state.fieldErrors}
        onSave={() => state.saveMutation.mutate()}
        onCancel={props.onCancel}
      />
    </div>
  );
});