import React, { useRef, useEffect } from 'react';

// ============================================================================
// CONSTANTES DE TIPOGRAFIA
// ============================================================================
export const TITLE_SIZES = {
  small: 'text-[clamp(1.15rem,2.2vw,1.5rem)]',
  base: 'text-[clamp(1.45rem,3vw,1.95rem)]',
  medium: 'text-[clamp(1.75rem,4vw,2.4rem)]',
  large: 'text-[clamp(2.1rem,5vw,2.85rem)]' // Ajustado para máxima segurança em duas linhas
};

export const SUBTITLE_SIZES = {
  small: 'text-[12px]',
  base: 'text-[12px] md:text-[13px]',
  medium: 'text-[13px] md:text-sm',
  large: 'text-sm md:text-base'
};

// ============================================================================
// DADOS DE PAÍSES E BUSCA INTELIGENTE
// ============================================================================
export const ISO_COUNTRIES = ["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BA","BW","BR","IO","VG","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","VI","UY","UZ","VU","VA","VE","VN","WF","EH","YE","ZM","ZW"];

export const COUNTRY_ALIASES: Record<string, string> = {
  mz: 'moz moza mozambique moçambique mocambique',
  ao: 'angola',
  cv: 'cabo verde',
  gw: 'guine bissau',
  st: 'sao tome e principe',
  br: 'brasil brazil br',
  pt: 'portugal pt',
  us: 'usa united states estados unidos eua america',
  gb: 'uk reino unido inglaterra england britain',
  cn: 'china',
  in: 'india',
  za: 'south africa africa do sul',
  es: 'spain espanha',
  fr: 'france franca frança',
  de: 'germany alemanha',
  it: 'italy italia',
  jp: 'japan japao',
};

export const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// ============================================================================
// ÍCONES E LINKS SOCIAIS (SVGs Otimizados)
// ============================================================================
export const PLATFORMS: Record<string, { name: string, getUrl: (v: string) => string, icon: React.ReactNode }> = {
  whatsapp: {
    name: 'WhatsApp',
    getUrl: (v) => `https://wa.me/${v.replace(/\D/g, '')}`,
    icon: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  },
  linkedin: {
    name: 'LinkedIn',
    getUrl: (v) => v.startsWith('http') ? v : `https://linkedin.com/in/${v.replace('@', '')}`,
    icon: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  },
  twitter: {
    name: 'X (Twitter)',
    getUrl: (v) => v.startsWith('http') ? v : `https://x.com/${v.replace('@', '')}`,
    icon: <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
  },
  instagram: {
    name: 'Instagram',
    getUrl: (v) => v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '')}`,
    icon: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  },
  github: {
    name: 'GitHub',
    getUrl: (v) => v.startsWith('http') ? v : `https://github.com/${v.replace('@', '')}`,
    icon: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
  },
  facebook: {
    name: 'Facebook',
    getUrl: (v) => v.startsWith('http') ? v : `https://facebook.com/${v.replace('@', '')}`,
    icon: <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  }
};

// ============================================================================
// COMPONENTES DE UI COMPARTILHADOS (Alta Performance)
// ============================================================================
export const ContentEditableField = React.memo(({ value, fallback, tagName: Tag = 'p', className, isEditor, maxLength, onUpdate }: any) => {
  const elementRef = useRef<HTMLElement>(null);
  const isFocused = useRef(false);

  const safeValue = (value || '').trim() === '' ? fallback : value;

  useEffect(() => {
    if (elementRef.current && !isFocused.current) {
      if (elementRef.current.textContent !== safeValue) {
        elementRef.current.textContent = safeValue;
      }
    }
  }, [safeValue]);

  return (
    <Tag
      ref={elementRef}
      className={className}
      contentEditable={isEditor}
      suppressContentEditableWarning
      onFocus={() => { isFocused.current = true; }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        isFocused.current = false;
        let text = (e.currentTarget.textContent || '').trim();
        
        // Bloqueia campos vazios
        if (!text) {
          text = fallback;
          e.currentTarget.textContent = fallback;
        }
        
        // Corta limites
        if (text.length > maxLength) {
          text = text.slice(0, maxLength);
          e.currentTarget.textContent = text;
        }

        if (text !== value) {
          onUpdate(text);
        }
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if ((e.currentTarget.textContent || '').length >= maxLength && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      }}
      onPaste={(e: React.ClipboardEvent<HTMLElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, paste.slice(0, maxLength));
      }}
      dangerouslySetInnerHTML={{ __html: safeValue }}
    />
  );
}, (prev, next) => prev.value === next.value && prev.isEditor === next.isEditor && prev.className === next.className);