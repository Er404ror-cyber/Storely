import { ImageIcon, Star, ShoppingCart, Plus, } from 'lucide-react';
import { useTranslate } from '../context/LanguageContext';

const getImg = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=600`;

export const useTemplates = () => {
  const { t } = useTranslate();

  const TEMPLATES = {
    // --- PHOTOGRAPHY ---
    photography: { 
      label: t('templates_photography_label'), 
      icon: <ImageIcon size={22} />,
      description: t('templates_photography_description'),
      sections: [
        { 
          type: 'hero_comercial', 
          content: { 
            title: t('templates_photography_hero_title'), 
            sub: t('templates_photography_hero_sub') 
          }, 
          style: { theme: 'light', align: 'left', fontSize: 'small' }, 
          order_index: 0 
        },
        { 
          type: 'galeria_grid', 
          content: { 
            title: t('templates_photography_gallery_empty_title'), 
            sub: t('templates_photography_gallery_empty_sub'),
            images: [] 
          }, 
          style: { theme: 'light', cols: '1', align: 'left' }, 
          order_index: 1 
        },
        { 
          type: 'galeria_grid', 
          content: { 
            title: t('templates_photography_gallery_insp_title'), 
            sub: t('templates_photography_gallery_insp_sub'),
            images: [
              { url: getImg('1501785888041-af3ef285b470'), title: 'Exemplo 2' },
            { url: getImg('1490730141103-6cac27aaab94'), title: 'Exemplo 1' },
            { url: getImg('1470770841072-f978cf4d019e'), title: 'Exemplo 4' },
            { url: getImg('1580489944761-15a19d654956'), title: 'Innovator' },
            ]
          }, 
          style: { theme: 'light', cols: '1', align: 'center' }, 
          order_index: 2 
        },
        { type: 'contacto_mapa', content: { title: t('templates_photography_contact_title') }, style: { theme: 'dark', align: 'center', fontSize: 'small' }, order_index: 3 }
      ] 
    },

    // --- SAAS / PRODUCT ---
    saas_product: { 
      label: t('templates_saas_label'), 
      icon: <ShoppingCart size={22} />,
      description: t('templates_saas_description'),
      sections: [
        { 
          type: 'hero_comercial', 
          content: { title: t('templates_saas_hero_title'), sub: t('templates_saas_hero_sub') }, 
          style: { theme: 'dark', align: 'left', fontSize: 'medium' }, 
          order_index: 0 
        },
        { 
          type: 'vitrine_produtos', 
          content: { 
            title: t('templates_saas_pricing_title'),
            items: [
              { id: 1, name: 'Basic Cloud', price: `${t('currency_mt')} 1.500${t('unit_per_month')}`, img: getImg('1460925895917-afdab827c52f'), tag: t('common_starter') },
              { id: 2, name: 'Pro Business', price: `${t('currency_mt')} 4.200${t('unit_per_month')}`, img: getImg('1551288049-bbbda536339a'), tag: t('common_best_seller') }
            ]
          }, 
          style: { theme: 'light', cols: '2', align: 'left' }, 
          order_index: 1 
        },
        { type: 'contacto_mapa', content: { title: t('templates_saas_contact_title') }, style: { theme: 'dark', align: 'center' }, order_index: 2 }
      ] 
    },

    // --- PERSONAL BRAND ---
    personal_brand: {
        label: t('templates_brand_label'),
        icon: <Star size={22} />,
        description: t('templates_brand_description'),
        sections: [
            { 
                type: 'hero_comercial', 
                content: { title: t('templates_brand_hero_title'), sub: t('templates_brand_hero_sub') }, 
                style: { theme: 'dark', align: 'left', fontSize: 'medium' }, 
                order_index: 0 
            },
            { 
                type: 'estatisticas_larga', 
                content: { 
                    items: [
                        {title: t('templates_brand_stats_students'), desc: '5.000+'}, 
                        {title: t('templates_brand_stats_lives'), desc: '120'}, 
                        {title: t('templates_brand_stats_countries'), desc: '12'}, 
                        {title: t('templates_brand_stats_roi'), desc: '5x'}
                    ] 
                }, 
                style: { theme: 'dark', align: 'center', fontSize: 'large' }, 
                order_index: 1 
            },
            { type: 'contacto_mapa', content: { title: t('templates_brand_contact_title') }, style: { theme: 'light', align: 'center' }, order_index: 2 }
        ]
    },

    // --- BLANK ---
    blank: { 
        label: t('templates_blank_label'), 
        icon: <Plus size={22} />, 
        description: t('templates_blank_description'), 
        sections: [] 
    }
  };

  return TEMPLATES;
};