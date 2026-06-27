export type CurrencyPresentation = {
    code: string;
    country: string;
    flag: string;
    symbol?: string;
  };
  
  const CURRENCY_META_MAP: Record<string, CurrencyPresentation> = {
    USD: { code: "USD", country: "United States", flag: "🇺🇸", symbol: "$" },
    EUR: { code: "EUR", country: "Euro Area", flag: "🇪🇺", symbol: "€" },
    GBP: { code: "GBP", country: "United Kingdom", flag: "🇬🇧", symbol: "£" },
    INR: { code: "INR", country: "India", flag: "🇮🇳", symbol: "₹" },
    MZN: { code: "MZN", country: "Mozambique", flag: "🇲🇿" },
    ZAR: { code: "ZAR", country: "South Africa", flag: "🇿🇦", symbol: "R" },
    BRL: { code: "BRL", country: "Brazil", flag: "🇧🇷", symbol: "R$" },
    CAD: { code: "CAD", country: "Canada", flag: "🇨🇦", symbol: "$" },
    AUD: { code: "AUD", country: "Australia", flag: "🇦🇺", symbol: "$" },
    NZD: { code: "NZD", country: "New Zealand", flag: "🇳🇿", symbol: "$" },
    AED: { code: "AED", country: "United Arab Emirates", flag: "🇦🇪" },
    SAR: { code: "SAR", country: "Saudi Arabia", flag: "🇸🇦" },
    JPY: { code: "JPY", country: "Japan", flag: "🇯🇵", symbol: "¥" },
    CNY: { code: "CNY", country: "China", flag: "🇨🇳", symbol: "¥" },
    CHF: { code: "CHF", country: "Switzerland", flag: "🇨🇭" },
    SEK: { code: "SEK", country: "Sweden", flag: "🇸🇪" },
    NOK: { code: "NOK", country: "Norway", flag: "🇳🇴" },
    DKK: { code: "DKK", country: "Denmark", flag: "🇩🇰" },
    SGD: { code: "SGD", country: "Singapore", flag: "🇸🇬", symbol: "$" },
    HKD: { code: "HKD", country: "Hong Kong", flag: "🇭🇰", symbol: "$" },
    KES: { code: "KES", country: "Kenya", flag: "🇰🇪" },
    NGN: { code: "NGN", country: "Nigeria", flag: "🇳🇬", symbol: "₦" },
    EGP: { code: "EGP", country: "Egypt", flag: "🇪🇬" },
    PKR: { code: "PKR", country: "Pakistan", flag: "🇵🇰", symbol: "₨" },
    BDT: { code: "BDT", country: "Bangladesh", flag: "🇧🇩", symbol: "৳" },
    LKR: { code: "LKR", country: "Sri Lanka", flag: "🇱🇰", symbol: "₨" },
    NPR: { code: "NPR", country: "Nepal", flag: "🇳🇵", symbol: "₨" },
    THB: { code: "THB", country: "Thailand", flag: "🇹🇭", symbol: "฿" },
    MYR: { code: "MYR", country: "Malaysia", flag: "🇲🇾", symbol: "RM" },
    IDR: { code: "IDR", country: "Indonesia", flag: "🇮🇩", symbol: "Rp" },
    PHP: { code: "PHP", country: "Philippines", flag: "🇵🇭", symbol: "₱" },
    KRW: { code: "KRW", country: "South Korea", flag: "🇰🇷", symbol: "₩" },
    TRY: { code: "TRY", country: "Turkey", flag: "🇹🇷", symbol: "₺" },
    RUB: { code: "RUB", country: "Russia", flag: "🇷🇺", symbol: "₽" },
    UAH: { code: "UAH", country: "Ukraine", flag: "🇺🇦", symbol: "₴" },
    PLN: { code: "PLN", country: "Poland", flag: "🇵🇱", symbol: "zł" },
    CZK: { code: "CZK", country: "Czech Republic", flag: "🇨🇿", symbol: "Kč" },
    HUF: { code: "HUF", country: "Hungary", flag: "🇭🇺", symbol: "Ft" },
    RON: { code: "RON", country: "Romania", flag: "🇷🇴", symbol: "lei" },
    MAD: { code: "MAD", country: "Morocco", flag: "🇲🇦" },
    TND: { code: "TND", country: "Tunisia", flag: "🇹🇳" },
    GHS: { code: "GHS", country: "Ghana", flag: "🇬🇭", symbol: "₵" },
    UGX: { code: "UGX", country: "Uganda", flag: "🇺🇬" },
    TZS: { code: "TZS", country: "Tanzania", flag: "🇹🇿" },
    ETB: { code: "ETB", country: "Ethiopia", flag: "🇪🇹" },
    AOA: { code: "AOA", country: "Angola", flag: "🇦🇴" },
    BWP: { code: "BWP", country: "Botswana", flag: "🇧🇼" },
    ZMW: { code: "ZMW", country: "Zambia", flag: "🇿🇲" },
  };
  
  export function getCurrencyPresentation(currency?: string | null): CurrencyPresentation | null {
    const code = (currency || "").trim().toUpperCase();
    if (!code) return null;
  
    return CURRENCY_META_MAP[code] || { code, country: code, flag: "🏳️" };
  }