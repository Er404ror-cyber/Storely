const TZ_GEO_MAP: Record<string, { currency: string; country: string }> = {
  // 🌏 ASIA
  "Asia/Kolkata": { currency: "INR", country: "IN" },
  "Asia/Dubai": { currency: "AED", country: "AE" },
  "Asia/Singapore": { currency: "SGD", country: "SG" },
  "Asia/Kuala_Lumpur": { currency: "MYR", country: "MY" },
  "Asia/Bangkok": { currency: "THB", country: "TH" },
  "Asia/Jakarta": { currency: "IDR", country: "ID" },
  "Asia/Manila": { currency: "PHP", country: "PH" },
  "Asia/Tokyo": { currency: "JPY", country: "JP" },
  "Asia/Seoul": { currency: "KRW", country: "KR" },
  "Asia/Shanghai": { currency: "CNY", country: "CN" },
  "Asia/Hong_Kong": { currency: "HKD", country: "HK" },
  "Asia/Karachi": { currency: "PKR", country: "PK" },
  "Asia/Dhaka": { currency: "BDT", country: "BD" },
  "Asia/Colombo": { currency: "LKR", country: "LK" },
  "Asia/Kathmandu": { currency: "NPR", country: "NP" },
  // 🌍 AFRICA
  "Africa/Johannesburg": { currency: "ZAR", country: "ZA" },
  "Africa/Maputo": { currency: "MZN", country: "MZ" },
  "Africa/Lagos": { currency: "NGN", country: "NG" },
  "Africa/Nairobi": { currency: "KES", country: "KE" },
  "Africa/Cairo": { currency: "EGP", country: "EG" },
  "Africa/Casablanca": { currency: "MAD", country: "MA" },
  "Africa/Tunis": { currency: "TND", country: "TN" },
  "Africa/Accra": { currency: "GHS", country: "GH" },
  "Africa/Addis_Ababa": { currency: "ETB", country: "ET" },
  "Africa/Harare": { currency: "ZWG", country: "ZW" },
  // 🇪🇺 EUROPE
  "Europe/London": { currency: "GBP", country: "GB" },
  "Europe/Zurich": { currency: "CHF", country: "CH" },
  "Europe/Stockholm": { currency: "SEK", country: "SE" },
  "Europe/Oslo": { currency: "NOK", country: "NO" },
  "Europe/Copenhagen": { currency: "DKK", country: "DK" },
  "Europe/Prague": { currency: "CZK", country: "CZ" },
  "Europe/Warsaw": { currency: "PLN", country: "PL" },
  "Europe/Budapest": { currency: "HUF", country: "HU" },
  "Europe/Bucharest": { currency: "RON", country: "RO" },
  "Europe/Istanbul": { currency: "TRY", country: "TR" },
  "Europe/Paris": { currency: "EUR", country: "FR" },
  "Europe/Berlin": { currency: "EUR", country: "DE" },
  "Europe/Madrid": { currency: "EUR", country: "ES" },
  "Europe/Rome": { currency: "EUR", country: "IT" },
  "Europe/Amsterdam": { currency: "EUR", country: "NL" },
  "Europe/Brussels": { currency: "EUR", country: "BE" },
  "Europe/Vienna": { currency: "EUR", country: "AT" },
  "Europe/Helsinki": { currency: "EUR", country: "FI" },
  "Europe/Dublin": { currency: "EUR", country: "IE" },
  "Europe/Lisbon": { currency: "EUR", country: "PT" },
  "Europe/Athens": { currency: "EUR", country: "GR" },
  // 🌎 AMERICAS
  "America/New_York": { currency: "USD", country: "US" },
  "America/Chicago": { currency: "USD", country: "US" },
  "America/Denver": { currency: "USD", country: "US" },
  "America/Los_Angeles": { currency: "USD", country: "US" },
  "America/Toronto": { currency: "CAD", country: "CA" },
  "America/Vancouver": { currency: "CAD", country: "CA" },
  "America/Mexico_City": { currency: "MXN", country: "MX" },
  "America/Sao_Paulo": { currency: "BRL", country: "BR" },
  "America/Argentina/Buenos_Aires": { currency: "ARS", country: "AR" },
  "America/Santiago": { currency: "CLP", country: "CL" },
  "America/Bogota": { currency: "COP", country: "CO" },
  "America/Lima": { currency: "PEN", country: "PE" },
  // 🌏 OCEANIA
  "Australia/Sydney": { currency: "AUD", country: "AU" },
  "Australia/Melbourne": { currency: "AUD", country: "AU" },
  "Australia/Perth": { currency: "AUD", country: "AU" },
  "Pacific/Auckland": { currency: "NZD", country: "NZ" },
};

export const getUserGeoConfig = () => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserLocale = window.navigator.language || "en-US";
    const allLanguages = window.navigator.languages || [];
    const [lang, region] = browserLocale.split('-');
    const countryCodeFromLocale = region?.toUpperCase();

    const systemCurrency = new Intl.NumberFormat(browserLocale, { 
      style: 'currency', 
      currency: 'USD' 
    }).resolvedOptions().currency;

    console.log("--- 🕵️ ANÁLISE GEO INICIADA ---");
    console.log(`Dados Brutos: TZ=${timeZone} | Locale=${browserLocale} | Lang=${lang}`);

    // 1. Prioridade: Moeda do Sistema (Se for específica)
    if (systemCurrency && systemCurrency !== "USD") {
      const currencyToCountry: Record<string, string> = { 
        "BRL": "BR", "EUR": "PT", "MZN": "MZ", "INR": "IN", "AOA": "AO", "ZAR": "ZA" 
      };
      const result = { 
        currency: systemCurrency, 
        country: currencyToCountry[systemCurrency] || countryCodeFromLocale || "US" 
      };
      console.log(`✅ ETAPA 1: Moeda do sistema detectada: ${systemCurrency}`);
      return result;
    }

    // 2. Desempate África Austral (GMT+2 Shared)
    const southernAfricaTZs = ["Africa/Johannesburg", "Africa/Maputo", "Africa/Harare", "Africa/Gaborone", "Africa/Blantyre"];
    if (southernAfricaTZs.includes(timeZone)) {
      console.log("🔍 ETAPA 2: Conflito GMT+2. Analisando idiomas...");
      
      const isLusophone = allLanguages.some(l => 
        l.toLowerCase().includes("mz") || l.toLowerCase().startsWith("pt")
      );

      if (isLusophone) {
        console.log("✅ DECISÃO: Moçambique (MZ/MZN) via rastro de idioma.");
        return { currency: "MZN", country: "MZ" };
      }
      
      if (countryCodeFromLocale === "ZW" || timeZone.includes("Harare")) {
        console.log("✅ DECISÃO: Zimbabwe (ZW/ZWG) via região ou TZ específica.");
        return { currency: "ZWG", country: "ZW" };
      }
      
      console.log("✅ DECISÃO: África do Sul (ZA/ZAR) como padrão GMT+2.");
      return { currency: "ZAR", country: "ZA" };
    }

    // 3. Mapeamento Direto do Teu Dicionário
    if (TZ_GEO_MAP[timeZone]) {
      console.log(`✅ ETAPA 3: Mapeamento direto via fuso horário: ${timeZone}`);
      return TZ_GEO_MAP[timeZone];
    }

    // 4. Fallback por Região (Ex: pt-BR ou en-US)
    const countryToGeo: Record<string, { currency: string; country: string }> = { 
      "BR": { currency: "BRL", country: "BR" },
      "PT": { currency: "EUR", country: "PT" },
      "US": { currency: "USD", country: "US" },
      "MZ": { currency: "MZN", country: "MZ" },
      "IN": { currency: "INR", country: "IN" }
    };
    
    if (countryCodeFromLocale && countryToGeo[countryCodeFromLocale]) {
      console.log(`✅ ETAPA 4: Fallback por região do navegador: ${countryCodeFromLocale}`);
      return countryToGeo[countryCodeFromLocale];
    }

    console.log("⚠️ ETAPA FINAL: Sem regras específicas. Fallback Global (US/USD).");
    return { currency: "USD", country: "US" };

  } catch {
    return { currency: "USD", country: "US" };
  } finally {
    console.log("--- 🏁 ANÁLISE GEO FINALIZADA ---");
  }
};

export const getUserCurrency = (): string => getUserGeoConfig().currency;
export const getUserCountry = (): string => getUserGeoConfig().country;