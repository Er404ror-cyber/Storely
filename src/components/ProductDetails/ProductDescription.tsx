import { memo } from "react";
import { AlignLeft } from "lucide-react";

interface ProductDescriptionProps {
  description: string;
  mutedTextClass: string;
  strongTextClass: string;
  t: any;
}

export const ProductDescription = memo(function ProductDescription({
  description,
  mutedTextClass,
  strongTextClass,
  t,
}: ProductDescriptionProps) {
  if (!description) return null;

  return (
    <div
      className="mt-12 md:mt-20 border-t border-slate-200 pt-10 dark:border-zinc-800 px-4 md:px-0"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 300px' }}
    >
      <div className="flex items-center gap-2 mb-6">
        <AlignLeft size={20} className={mutedTextClass} />
        <h3 className={`text-xl font-extrabold tracking-tight ${strongTextClass}`}>
          {t("product_details_details" as any) || "Details"}
        </h3>
      </div>
      <div className={`max-w-3xl text-[16px] leading-loose whitespace-pre-wrap [overflow-wrap:anywhere] ${mutedTextClass}`}>
        {description}
      </div>
    </div>
  );
});