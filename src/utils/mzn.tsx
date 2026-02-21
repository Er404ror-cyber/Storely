export const getUserCurrency = () => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    console.log("🌍 timeZone →", timeZone);

    const tzToCurrency: Record<string, string> = {
      // 🌏 ASIA
      "Asia/Kolkata": "INR",
      "Asia/Dubai": "AED",
      "Asia/Singapore": "SGD",
      "Asia/Kuala_Lumpur": "MYR",
      "Asia/Bangkok": "THB",
      "Asia/Jakarta": "IDR",
      "Asia/Manila": "PHP",
      "Asia/Tokyo": "JPY",
      "Asia/Seoul": "KRW",
      "Asia/Shanghai": "CNY",
      "Asia/Hong_Kong": "HKD",
      "Asia/Karachi": "PKR",
      "Asia/Dhaka": "BDT",
      "Asia/Colombo": "LKR",
      "Asia/Kathmandu": "NPR",

      // 🌍 AFRICA
      "Africa/Johannesburg": "ZAR",
      "Africa/Maputo": "MZN",
      "Africa/Lagos": "NGN",
      "Africa/Nairobi": "KES",
      "Africa/Cairo": "EGP",
      "Africa/Casablanca": "MAD",
      "Africa/Tunis": "TND",
      "Africa/Accra": "GHS",
      "Africa/Addis_Ababa": "ETB",
      "Africa/Harare": "ZWG",

      // 🇪🇺 EUROPE
      "Europe/London": "GBP",
      "Europe/Zurich": "CHF",
      "Europe/Stockholm": "SEK",
      "Europe/Oslo": "NOK",
      "Europe/Copenhagen": "DKK",
      "Europe/Prague": "CZK",
      "Europe/Warsaw": "PLN",
      "Europe/Budapest": "HUF",
      "Europe/Bucharest": "RON",
      "Europe/Istanbul": "TRY",

      // EURO (grupo grande)
      "Europe/Paris": "EUR",
      "Europe/Berlin": "EUR",
      "Europe/Madrid": "EUR",
      "Europe/Rome": "EUR",
      "Europe/Amsterdam": "EUR",
      "Europe/Brussels": "EUR",
      "Europe/Vienna": "EUR",
      "Europe/Helsinki": "EUR",
      "Europe/Dublin": "EUR",
      "Europe/Lisbon": "EUR",
      "Europe/Athens": "EUR",

      // 🌎 AMERICAS
      "America/New_York": "USD",
      "America/Chicago": "USD",
      "America/Denver": "USD",
      "America/Los_Angeles": "USD",
      "America/Toronto": "CAD",
      "America/Vancouver": "CAD",
      "America/Mexico_City": "MXN",
      "America/Sao_Paulo": "BRL",
      "America/Argentina/Buenos_Aires": "ARS",
      "America/Santiago": "CLP",
      "America/Bogota": "COP",
      "America/Lima": "PEN",

      // 🌏 OCEANIA
      "Australia/Sydney": "AUD",
      "Australia/Melbourne": "AUD",
      "Australia/Perth": "AUD",
      "Pacific/Auckland": "NZD",
    };

    const currency = tzToCurrency[timeZone] || "MZN";

    console.log("💰 currency →", currency);

    return currency;
  } catch {
    return "USD";
  }
};