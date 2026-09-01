import { generateDesktopPresentation, type PresentationConfig, type StoreDBData } from './generateDesktopPresentation';
import { generateMobilePresentation } from './generateMobilePresentation';

export type { PresentationConfig, StoreDBData };

function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Client Hints moderno (se suportado)
  const nav = navigator as any;
  if (nav.userAgentData?.mobile !== undefined) {
    return Boolean(nav.userAgentData.mobile);
  }

  // 2. User-Agent clássico
  const userAgent = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  if (isMobileUA) return true;

  // 3. iPad com iPadOS moderno (identifica-se como MacIntel mas tem ecrã tátil)
  const isModernIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (isModernIPad) return true;

  // 4. Ecrã pequeno (smartphones/tablets em modo retrato)
  if (window.innerWidth <= 768) return true;

  // 5. Media queries de interação tátil sem rato convencional
  const hasTouchOnly = window.matchMedia?.('(pointer: coarse) and (hover: none)').matches;
  if (hasTouchOnly) return true;

  return false;
}

export function generateStorePresentationPDF(config: PresentationConfig) {
  const isMobile = checkIsMobile();

  // Log limpo e direto apenas com o resultado final
  console.log(
    `%c[PDF Generator] Dispositivo detetado: ${isMobile ? '📱 Mobile' : '💻 Desktop'}`,
    `font-weight: bold; color: ${isMobile ? '#16a34a' : '#2563eb'}; font-size: 13px;`
  );

  if (isMobile) {
    generateMobilePresentation(config);
  } else {
    generateDesktopPresentation(config);
  }
}

export default generateStorePresentationPDF;