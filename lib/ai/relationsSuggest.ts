import { relationsSuggestionSchema, type RelationSuggestion } from "./schemas";
import { generateJson } from "./provider";

const westernRights = [
  "united states",
  "united kingdom",
  "france",
  "germany",
  "canada",
  "australia",
  "netherlands",
  "sweden",
  "norway",
  "denmark",
  "finland",
  "belgium",
  "spain",
  "italy",
  "ireland",
  "new zealand",
];

const sovereigntyFirst = ["china", "russia", "iran", "belarus", "syria", "venezuela", "cuba", "north korea"];
const islamicLegalContext = [
  "saudi arabia",
  "pakistan",
  "qatar",
  "united arab emirates",
  "uae",
  "iran",
  "oman",
  "kuwait",
  "turkiye",
  "turkey",
  "malaysia",
  "indonesia",
  "egypt",
  "bangladesh",
];
const globalSouthMediators = [
  "india",
  "brazil",
  "south africa",
  "kenya",
  "mexico",
  "nigeria",
  "ghana",
  "argentina",
  "indonesia",
  "philippines",
];

function key(value: string) {
  return value.trim().toLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function classifyRelation(input: {
  portfolio: string;
  topic: string;
  member: string;
  index: number;
}): RelationSuggestion {
  const portfolio = key(input.portfolio);
  const topic = key(input.topic);
  const member = key(input.member);
  const isSelf = portfolio && member === portfolio;
  const isShariaWomen = includesAny(topic, ["sharia", "women", "girl", "education", "rights"]);

  if (isSelf) {
    return {
      country: input.member,
      stance: "ally",
      confidence: 100,
      bloc: "Own portfolio",
      rationale: "This is your own portfolio, so it anchors your speeches, amendments, and voting posture.",
    };
  }

  if (portfolio.includes("afghanistan") && isShariaWomen) {
    if (westernRights.includes(member)) {
      return {
        country: input.member,
        stance: "opposed",
        confidence: 86,
        bloc: "Rights accountability bloc",
        rationale:
          "Likely conflict on UN Women language: this portfolio will push CEDAW, girls' education, work and movement rights, and scrutiny of post-2021 restrictions, while Afghanistan resists clauses that condemn Sharia or override sovereignty.",
      };
    }

    if (islamicLegalContext.includes(member)) {
      return {
        country: input.member,
        stance: member === "iran" ? "lean ally" : "ally",
        confidence: member === "iran" ? 68 : 78,
        bloc: "Religious-law sovereignty bloc",
        rationale:
          "Shared interest in protecting religious legal framing and sovereignty language. This bloc may still accept practical clauses on humanitarian access, health, and education if they avoid portraying Islamic law itself as the violation.",
      };
    }

    if (sovereigntyFirst.includes(member)) {
      return {
        country: input.member,
        stance: "lean ally",
        confidence: 74,
        bloc: "Non-interference bloc",
        rationale:
          "Likely alignment on resisting sanctions, external monitoring, or country-specific condemnation. The shared legal argument is sovereignty and non-interference rather than identical domestic law on women or Sharia.",
      };
    }

    if (globalSouthMediators.includes(member)) {
      return {
        country: input.member,
        stance: "neutral",
        confidence: 62,
        bloc: "Bridge builders",
        rationale:
          "Likely to seek compromise language: support for women and girls, CEDAW-style anti-discrimination principles, and education access, while avoiding overly punitive wording that alienates sovereignty-focused states.",
      };
    }
  }

  if (westernRights.includes(member)) {
    return {
      country: input.member,
      stance: "lean opposed",
      confidence: 70,
      bloc: "Rights accountability bloc",
      rationale: `Likely to favor rights-based obligations, reporting, and legal safeguards on ${input.topic}. Check treaty commitments, equality laws, and recent policy changes before using them as amendment evidence.`,
    };
  }

  if (sovereigntyFirst.includes(member)) {
    return {
      country: input.member,
      stance: "lean ally",
      confidence: 66,
      bloc: "Non-interference bloc",
      rationale: `Likely to resist intrusive enforcement on ${input.topic} and prefer sovereignty, consent, and capacity-building language over sanctions or external monitoring.`,
    };
  }

  if (globalSouthMediators.includes(member)) {
    return {
      country: input.member,
      stance: "neutral",
      confidence: 58,
      bloc: "Bridge builders",
      rationale: `Likely to balance rights language with development, funding, and implementation concerns. Useful for clauses that connect ${input.topic} to capacity building or technical assistance.`,
    };
  }

  return {
    country: input.member,
    stance: input.index % 4 === 0 ? "neutral" : input.index % 3 === 0 ? "lean opposed" : "lean ally",
    confidence: 50 + ((input.index * 9) % 28),
    rationale: `Position needs verification, but likely depends on domestic law, treaty posture, recent policy changes, and whether ${input.topic} is framed as rights protection, sovereignty, security, or implementation funding.`,
    bloc: input.index % 3 === 0 ? "Issue-specific swing votes" : "Cautious implementers",
  };
}

export async function suggestRelations(input: {
  country: string;
  committee?: string;
  topic: string;
  roster: string[];
  researchContext?: string;
}) {
  const roster = Array.from(new Set(input.roster.map((item) => item.trim()).filter(Boolean)));
  const fallback: RelationSuggestion[] = roster.map((member, index) =>
    classifyRelation({
      portfolio: input.country,
      topic: input.topic,
      member,
      index,
    }),
  );

  const result = await generateJson(
    `Delegate portfolio: ${input.country}
Committee: ${input.committee ?? "Use the active committee mandate."}
Topic: ${input.topic}
Roster: ${roster.join(", ")}
Imported delegate research:
${input.researchContext || "No uploaded research sources."}

Build a relations matrix for Model UN.

Rules:
- Return one suggestion for every roster entry.
- Rationale must not be generic.
- Mention concrete alignment logic: similar laws, treaty posture, domestic policy changes, sovereignty arguments, rights obligations, recent restrictions, sanctions posture, or implementation capacity.
- If exact law is uncertain, say what to verify rather than inventing a citation.
- Bloc names should be useful for caucusing and seating.

Return JSON: {"suggestions":[{"country": string, "stance": "ally"|"lean ally"|"neutral"|"lean opposed"|"opposed", "confidence": 0-100, "rationale": string, "bloc": string}]}`,
    relationsSuggestionSchema,
    { suggestions: fallback },
  );

  const byCountry = new Map(fallback.map((item) => [key(item.country), item]));
  return result.suggestions.length === roster.length
    ? result.suggestions.map((suggestion) => ({
        ...suggestion,
        rationale: suggestion.rationale.length > 35 ? suggestion.rationale : byCountry.get(key(suggestion.country))?.rationale ?? suggestion.rationale,
        bloc: suggestion.bloc || byCountry.get(key(suggestion.country))?.bloc,
      }))
    : fallback;
}
