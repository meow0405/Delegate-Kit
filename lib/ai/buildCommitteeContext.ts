import { committeeContextSchema, type CommitteeContext } from "./schemas";
import { generateJson } from "./provider";
import { getCommitteeRule } from "@/lib/committees/unRules";

export async function buildCommitteeContext(committee: string, topic: string, researchContext?: string) {
  const fallback: CommitteeContext = {
    mandate: getCommitteeRule(committee),
    proceduralNotes: [
      "Confirm speaking time, caucus rules, amendment thresholds, and voting procedure with the dais.",
      "Frame points through mandate, feasibility, and regional balance.",
    ],
    likelyFaultLines: ["state sovereignty vs. intervention", "funding burden", "monitoring and accountability"],
  };

  return generateJson(
    `Committee: ${committee}
Topic: ${topic}
Imported delegate research:
${researchContext || "No uploaded research sources."}

Return JSON with mandate, proceduralNotes, and likelyFaultLines for a delegate preparing strategy.`,
    committeeContextSchema,
    fallback,
  );
}
