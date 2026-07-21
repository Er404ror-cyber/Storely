import { HeroComercial } from './components/HeroComercial';
import { ServicosModern } from './components/ServicosModern';
import { GaleriaGrid } from './components/GaleriaGrid';
import { PrecosModerno } from './components/PrecosModerno';
import { ContactoMapa } from './components/ContactoMapa';
import { EstatisticasLarga } from './components/EstatisticasLarga';
import { ProductShowcase } from './components/ProductShowcase';
import { TextoNarrativo } from './components/TextoNarrativo';
import { TextoImagemShowcase } from './components/TextoImagemShowcase';
import { MediaLinksCompact } from './components/MediaEmbeds';
import { ProductsCatalog } from './components/ProductsCatalog';
import { PortfolioHero } from './components/EsportsProfileHero';

export const SectionLibrary = {
  hero_comercial: HeroComercial,
  estatisticas_larga: EstatisticasLarga,
  servicos_modern: ServicosModern,
  galeria_grid: GaleriaGrid,
  precos_moderno: PrecosModerno,
  contacto_mapa: ContactoMapa,
  vitrine_produtos: ProductShowcase,
  texto_narrativo: TextoNarrativo,
  texto_imagem_showcase: TextoImagemShowcase,
  media_embeds: MediaLinksCompact,
  products_catalog: ProductsCatalog,
  esports_profile: PortfolioHero, 
};

export * from '../../types/library';