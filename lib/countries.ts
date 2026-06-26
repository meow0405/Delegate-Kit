const countryCodes = [
  "AF", "AL", "DZ", "AD", "AO", "AR", "AM", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BT", "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "CF", "TD", "CL", "CN", "CO", "KM", "CG", "CD", "CR", "CI", "HR", "CU", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FJ", "FI", "FR", "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY", "HT", "HN", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MR", "MU", "MX", "FM", "MD", "MC", "MN", "ME", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "KP", "MK", "NO", "OM", "PK", "PW", "PA", "PG", "PY", "PE", "PH", "PL", "PT", "QA", "RO", "RU", "RW", "KN", "LC", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB", "SO", "ZA", "KR", "SS", "ES", "LK", "SD", "SR", "SE", "CH", "SY", "TJ", "TZ", "TH", "TL", "TG", "TO", "TT", "TN", "TR", "TM", "TV", "UG", "UA", "AE", "GB", "US", "UY", "UZ", "VU", "VA", "VE", "VN", "YE", "ZM", "ZW",
];

const aliases: Record<string, string> = {
  america: "US",
  "czech republic": "CZ",
  "democratic republic of congo": "CD",
  "dprk": "KP",
  "dr congo": "CD",
  england: "GB",
  hongkong: "HK",
  "hong kong": "HK",
  iran: "IR",
  "ivory coast": "CI",
  "north korea": "KP",
  "republic of korea": "KR",
  russia: "RU",
  "south korea": "KR",
  syria: "SY",
  turkey: "TR",
  uk: "GB",
  "united kingdom": "GB",
  usa: "US",
  us: "US",
  "united states": "US",
  "united states of america": "US",
  vietnam: "VN",
};

type PortfolioOption = {
  code: string;
  name: string;
  flag?: string;
  kind: "country" | "territory" | "portfolio";
};

const extraPortfolioOptions: PortfolioOption[] = [
  { code: "TW", name: "Taiwan", flag: "🇹🇼", kind: "territory" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", kind: "territory" },
  { code: "MO", name: "Macau", flag: "🇲🇴", kind: "territory" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", kind: "territory" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰", kind: "territory" },
  { code: "EU", name: "European Union", flag: "🇪🇺", kind: "territory" },
  { code: "CK", name: "Cook Islands", flag: "🇨🇰", kind: "territory" },
  { code: "NU", name: "Niue", flag: "🇳🇺", kind: "territory" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", kind: "territory" },
  { code: "GL", name: "Greenland", flag: "🇬🇱", kind: "territory" },
  { code: "FO", name: "Faroe Islands", flag: "🇫🇴", kind: "territory" },
  { code: "PF", name: "French Polynesia", flag: "🇵🇫", kind: "territory" },
  { code: "NC", name: "New Caledonia", flag: "🇳🇨", kind: "territory" },
  { code: "BJP", name: "Bharatiya Janata Party", kind: "portfolio" },
  { code: "INC", name: "Indian National Congress", kind: "portfolio" },
  { code: "AAP", name: "Aam Aadmi Party", kind: "portfolio" },
  { code: "TMC", name: "Trinamool Congress", kind: "portfolio" },
  { code: "DMK", name: "Dravida Munnetra Kazhagam", kind: "portfolio" },
  { code: "SP", name: "Samajwadi Party", kind: "portfolio" },
  { code: "PMINDIA", name: "Prime Minister of India", kind: "portfolio" },
  { code: "LOP", name: "Leader of Opposition", kind: "portfolio" },
  { code: "HMINDIA", name: "Home Minister of India", kind: "portfolio" },
  { code: "FMINDIA", name: "Finance Minister of India", kind: "portfolio" },
  { code: "EAMINDIA", name: "External Affairs Minister of India", kind: "portfolio" },
];

const displayNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function flagFromCode(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export const countryOptions: PortfolioOption[] = countryCodes
  .map((code): PortfolioOption => ({
    code,
    name: displayNames?.of(code) ?? code,
    flag: flagFromCode(code),
    kind: "country",
  }))
  .concat(extraPortfolioOptions)
  .sort((a, b) => a.name.localeCompare(b.name));

const countryLookup = new Map<string, PortfolioOption>();

for (const country of countryOptions) {
  countryLookup.set(normalize(country.name), country);
}

for (const [alias, code] of Object.entries(aliases)) {
  const country = countryOptions.find((option) => option.code === code);
  if (country) countryLookup.set(normalize(alias), country);
}

export function getCountryMatch(value: string) {
  return countryLookup.get(normalize(value));
}
