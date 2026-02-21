import { HeroComercial } from './components/HeroComercial';
import { ServicosModern } from './components/ServicosModern';
import { GaleriaGrid } from './components/GaleriaGrid';
import { PrecosModerno } from './components/PrecosModerno';
import { ContactoMapa } from './components/ContactoMapa';
import { EstatisticasLarga } from './components/EstatisticasLarga';
import { ProductShowcase } from './components/ProductShowcase';

export const SectionLibrary = {
  hero_comercial: HeroComercial,
  estatisticas_larga: EstatisticasLarga,
  servicos_modern: ServicosModern,
  galeria_grid: GaleriaGrid,
  precos_moderno: PrecosModerno,
  contacto_mapa: ContactoMapa,
  vitrine_produtos: ProductShowcase, // <--- Adicione aqui
};

export * from '../../types/library';