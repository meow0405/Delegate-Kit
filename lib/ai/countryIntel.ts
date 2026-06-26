import { countryIntelSchema, type CountryIntel } from "./schemas";
import { generateJson } from "./provider";

export async function getCountryIntel(input: {
  country: string;
  committee: string;
  topic: string;
}) {
  const fallback: CountryIntel = {
    summary: `${input.country} should anchor its position on ${input.topic} in portfolio interests, mandate constraints, alliances, and workable negotiating language.`,
    priorities: ["protect core sovereignty interests", "build practical consensus", "secure implementation support"],
    redLines: ["unfunded mandates", "overly intrusive monitoring", "language that conflicts with treaty obligations"],
    allies: ["regional partners", "states with similar development priorities"],
    risks: ["being isolated in voting blocs", "accepting vague implementation terms"],
    sources: ["UN charter principles", "committee mandate", "recent public statements"],
  };

  return generateJson(
    `Portfolio: ${input.country}
Committee: ${input.committee}
Topic: ${input.topic}

Return JSON matching:
{
  "summary": string,
  "priorities": string[],
  "redLines": string[],
  "allies": string[],
  "risks": string[],
  "sources": string[]
}`,
    countryIntelSchema,
    fallback,
  );
}
