export const getUserCurrency = (): string => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserLocale = window.navigator.language || "en-US";
    const allLanguages = window.navigator.languages || [];
    
    // Extrai região, ignorando a língua (lang) para evitar erro de 'unused-vars'
    const [region] = browserLocale.split('-');
    const countryCode = region?.toUpperCase();

    const systemCurrency = new Intl.NumberFormat(browserLocale, { 
      style: 'currency', 
      currency: 'USD' 
    }).resolvedOptions().currency;

    const tzToCurrency: Record<string, string> = {
      // 🌏 ASIA
      "Asia/Kolkata": "INR", "Asia/Dubai": "AED", "Asia/Singapore": "SGD",
      "Asia/Kuala_Lumpur": "MYR", "Asia/Bangkok": "THB", "Asia/Jakarta": "IDR",
      "Asia/Manila": "PHP", "Asia/Tokyo": "JPY", "Asia/Seoul": "KRW",
      "Asia/Shanghai": "CNY", "Asia/Hong_Kong": "HKD", "Asia/Karachi": "PKR",
      "Asia/Dhaka": "BDT", "Asia/Colombo": "LKR", "Asia/Kathmandu": "NPR",
      // 🌍 AFRICA
      "Africa/Johannesburg": "ZAR", "Africa/Maputo": "MZN", "Africa/Lagos": "NGN",
      "Africa/Nairobi": "KES", "Africa/Cairo": "EGP", "Africa/Casablanca": "MAD",
      "Africa/Tunis": "TND", "Africa/Accra": "GHS", "Africa/Addis_Ababa": "ETB",
      "Africa/Harare": "ZWG",
      // 🇪🇺 EUROPE
      "Europe/London": "GBP", "Europe/Zurich": "CHF", "Europe/Stockholm": "SEK",
      "Europe/Oslo": "NOK", "Europe/Copenhagen": "DKK", "Europe/Prague": "CZK",
      "Europe/Warsaw": "PLN", "Europe/Budapest": "HUF", "Europe/Bucharest": "RON",
      "Europe/Istanbul": "TRY", "Europe/Paris": "EUR", "Europe/Berlin": "EUR",
      "Europe/Madrid": "EUR", "Europe/Rome": "EUR", "Europe/Amsterdam": "EUR",
      "Europe/Brussels": "EUR", "Europe/Vienna": "EUR", "Europe/Helsinki": "EUR",
      "Europe/Dublin": "EUR", "Europe/Lisbon": "EUR", "Europe/Athens": "EUR",
      // 🌎 AMERICAS
      "America/New_York": "USD", "America/Chicago": "USD", "America/Denver": "USD",
      "America/Los_Angeles": "USD", "America/Toronto": "CAD", "America/Vancouver": "CAD",
      "America/Mexico_City": "MXN", "America/Sao_Paulo": "BRL", "America/Argentina/Buenos_Aires": "ARS",
      "America/Santiago": "CLP", "America/Bogota": "COP", "America/Lima": "PEN",
      // 🌏 OCEANIA
      "Australia/Sydney": "AUD", "Australia/Melbourne": "AUD", "Australia/Perth": "AUD",
      "Pacific/Auckland": "NZD",
    };

    console.log(`🕵️ Analisando Usuário: TZ=${timeZone} | System=${systemCurrency} | Locale=${browserLocale}`);

    // 1. Prioridade Sistema (Se não for genérica)
    if (systemCurrency && systemCurrency !== "USD") {
      return systemCurrency;
    }

    // 2. África Austral (Conflito GMT+2)
    const southernAfricaTZs = ["Africa/Johannesburg", "Africa/Maputo", "Africa/Harare", "Africa/Gaborone", "Africa/Blantyre"];
    if (southernAfricaTZs.includes(timeZone)) {
      // Procura qualquer rastro de Moçambique ou Português
      const isLusophone = allLanguages.some(l => 
        l.toLowerCase().includes("mz") || l.toLowerCase().startsWith("pt")
      );
      
      if (isLusophone) return "MZN";
      if (countryCode === "ZW" || timeZone.includes("Harare")) return "ZWG";
      
      return "ZAR";
    }

    // 3. Índia (Sua localização atual)
    if (timeZone === "Asia/Kolkata" || countryCode === "IN") {
      return "INR";
    }

    // 4. Mapeamento por Fuso
    if (tzToCurrency[timeZone]) {
      return tzToCurrency[timeZone];
    }

    // 5. Fallback por Região
    const countryToCurrency: Record<string, string> = { 
      "BR": "BRL", "US": "USD", "CA": "CAD", "AU": "AUD", "PT": "EUR" 
    };
    
    if (countryCode && countryToCurrency[countryCode]) {
      return countryToCurrency[countryCode];
    }

    return "USD";

  } catch {
    // Catch vazio sem a variável 'error' para o ESLint não reclamar
    return "USD";
  }
};