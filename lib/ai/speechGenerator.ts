import { speechSchema, type SpeechDraft } from "./schemas";
import { generateJson } from "./provider";

type SpeechStyle = "formal" | "dramatic" | "poetic" | "diplomatic" | "assertive";

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function trimToTarget(sentences: string[], targetWords: number, reservedWords = 0) {
  const selected: string[] = [];
  let words = 0;
  const usableWords = Math.max(20, targetWords - reservedWords);

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    if (selected.length > 0 && words + sentenceWords > usableWords + 12) break;
    selected.push(sentence);
    words += sentenceWords;
    if (words >= usableWords - 10) break;
  }

  return selected.join(" ");
}

function sentenceFragment(value: string) {
  return value.trim().replace(/[.?!]+$/g, "");
}

function sentenceCase(value: string) {
  const fragment = sentenceFragment(value);
  return fragment.charAt(0).toUpperCase() + fragment.slice(1);
}

function normalizeStyle(value?: string): SpeechStyle {
  if (value === "dramatic" || value === "poetic" || value === "diplomatic" || value === "assertive") {
    return value;
  }

  return "formal";
}

function styleGuide(style: SpeechStyle) {
  const guide: Record<SpeechStyle, { quote: string; tone: string; verb: string }> = {
    formal: {
      quote: "A strong resolution is not measured by its outrage, but by what it can implement.",
      tone: "measured, polished, and committee-ready",
      verb: "ask",
    },
    dramatic: {
      quote: "When law is debated, lives cannot be reduced to footnotes.",
      tone: "urgent, vivid, and commanding without becoming theatrical",
      verb: "call on",
    },
    poetic: {
      quote: "Rights must not be a distant promise; they must reach the classroom, the clinic, and the home.",
      tone: "lyrical, elegant, and restrained",
      verb: "invite",
    },
    diplomatic: {
      quote: "Durable progress begins where principle and trust can sit at the same table.",
      tone: "careful, bridge-building, and tactful",
      verb: "encourage",
    },
    assertive: {
      quote: "This committee needs language that protects people, not language that performs concern.",
      tone: "clear, firm, and solution-driven",
      verb: "urge",
    },
  };

  return guide[style];
}

function conciseStance(input: { country: string; topic: string; stance?: string }) {
  if (input.stance?.trim()) {
    const thesis = input.stance.split("Likely arguments:")[0] ?? input.stance;
    const words = sentenceFragment(thesis).split(/\s+/).filter(Boolean);
    return words.length > 46 ? `${words.slice(0, 46).join(" ")}...` : words.join(" ");
  }

  return `my country approaches ${input.topic} with a focus on practical clauses, realistic implementation, and language that protects national interests`;
}

function spokenArgument(value: string) {
  const cleaned = sentenceFragment(value);

  if (cleaned.toLowerCase().startsWith("affirm respect")) {
    return "respect religious legal traditions and national sovereignty, while still making room for real protections for women and girls";
  }

  if (cleaned.toLowerCase().startsWith("support language")) {
    return "support clauses on humanitarian access, maternal health, basic services, and girls' education when they are framed in a way communities can accept";
  }

  if (cleaned.toLowerCase().startsWith("oppose clauses")) {
    return "reject wording that turns this debate into a condemnation of faith, instead of a serious plan for people affected on the ground";
  }

  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function buildFallbackSpeech(input: {
  country: string;
  committee: string;
  topic: string;
  stance?: string;
  type?: string;
  style?: string;
  seconds: number;
  targetWords: number;
  focus: string;
}): SpeechDraft {
  const speechType = input.type === "mod" ? "MOD" : "GSL";
  const style = normalizeStyle(input.style);
  const guide = styleGuide(style);
  const stanceLine = conciseStance({
    country: input.country,
    topic: input.focus,
    stance: input.stance,
  });
  const mainArgument = spokenArgument("support practical clauses that fit the committee mandate");
  const secondArgument = spokenArgument("avoid wording that is vague, punitive, or impossible to implement");
  const quote = `"${guide.quote}"`;
  const intro =
    input.type === "mod"
      ? `Honourable Chair, fellow delegates, I speak on behalf of ${input.country} on ${input.focus}.`
      : `Honourable Chair, fellow delegates, I rise on behalf of ${input.country} to speak on ${input.topic}.`;
  const framing =
    style === "dramatic"
      ? "This debate is not about winning a line in a resolution. It is about the lives behind that line."
      : style === "poetic"
        ? "Behind every clause is a person, a classroom, a family, and a future."
        : style === "diplomatic"
          ? "This committee will make progress only if it respects principle and political reality at the same time."
        : style === "assertive"
            ? "This committee does not need softer language. It needs smarter language."
            : "This committee must be careful, practical, and honest about what its words can do.";
  const evidence = input.stance
    ? ["I also ask delegates to ground every claim in verified laws, policies, and public records before using it in debate."]
    : [];
  const baseSentences = [
    intro,
    `${sentenceCase(stanceLine)}.`,
    framing,
    `My country believes the responsible path is to ${mainArgument}.`,
    `We can also ${secondArgument}.`,
    ...evidence,
    input.seconds >= 60
      ? "That is the balance I ask this committee to protect: respect for context, but no silence where people need protection."
      : "",
  ].filter(Boolean);

  const closing =
    input.type === "mod"
      ? `So, on behalf of ${input.country}, I ${guide.verb} delegates to write clauses that are specific, culturally aware, and possible to carry out. Let this be a solution, not a slogan. Thank you.`
      : `So, on behalf of ${input.country}, I ${guide.verb} this committee to choose targeted clauses, careful definitions, and practical mechanisms. Let us write a resolution that can be spoken proudly and implemented honestly. Thank you.`;
  const bodyCore = trimToTarget(baseSentences.slice(0, -2), input.targetWords, countWords(quote) + countWords(closing));
  const body = `${bodyCore}\n\n${quote}\n\n${closing}`;

  return {
    title: `${input.country} ${speechType} speech - ${style}`,
    body,
    talkingPoints: [
      stanceLine,
      mainArgument,
      secondArgument,
    ].slice(0, 5),
  };
}

export async function generateSpeech(input: {
  country: string;
  committee: string;
  topic: string;
  stance?: string;
  type?: string;
  seconds?: number;
  modTopic?: string;
  style?: string;
}) {
  const type = input.type === "mod" ? "moderated caucus speech" : "GSL speech";
  const style = normalizeStyle(input.style);
  const guide = styleGuide(style);
  const seconds = Math.max(15, Math.min(Number(input.seconds) || 60, 300));
  const targetWords = Math.round(seconds * 3);
  const focus = input.type === "mod" && input.modTopic ? input.modTopic : input.topic;
  const fallback = buildFallbackSpeech({ ...input, style, seconds, targetWords, focus });

  const speech = await generateJson(
    `Write a ${type} for Model UN.
Portfolio: ${input.country}
Committee: ${input.committee}
Main agenda: ${input.topic}
Speech focus: ${focus}
Time limit: ${seconds} seconds
Target length: about ${targetWords} spoken words
Stance to reflect exactly: ${input.stance ?? fallback.talkingPoints[0]}
Chosen style: ${style}
Style direction: ${guide.tone}

Requirements:
- Make it fit the time limit with a full delegate pace. Spoken word count must be between ${Math.max(25, Math.round(targetWords * 0.86))} and ${Math.round(targetWords * 1.18)} words.
- Use 3 short paragraphs separated by blank lines.
- Put exactly one short quote line in its own paragraph, wrapped in double quotes, suitable for highlighting.
- Write for speaking out loud, not for reading silently.
- Use short sentences, natural transitions, and clear emphasis.
- Use delegate floor language: "I", "my country", "we", "on behalf of", and "I urge this committee".
- Avoid stiff conditional phrasing such as "would", "could", "should be considered", and "the delegation would".
- Avoid essay phrases like "is relevant because", "it is important to note", "aforementioned", or citation-dump wording.
- Evidence must sound like a delegate explaining it to committee, not like a research note.
- Do not include stage directions.
- If it is a GSL speech, frame the broad agenda and portfolio stance.
- If it is a moderated caucus speech, answer the mod topic directly and narrowly.
- Do not write a generic paragraph. Use the portfolio's stance, likely arguments, and legal or policy context.
- Make the conclusion contain one clear ask for the committee.

Return JSON with title, body, and talkingPoints.`,
    speechSchema,
    fallback,
  );

  const words = countWords(speech.body);
  const minWords = Math.max(25, Math.round(targetWords * 0.74));
  const maxWords = Math.round(targetWords * 1.35);

  if (
    words < minWords ||
    words > maxWords ||
    !speech.body.toLowerCase().includes(input.country.toLowerCase()) ||
    !speech.body.includes("\n\n") ||
    !/"[^"]+"/.test(speech.body)
  ) {
    return fallback;
  }

  return speech;
}
