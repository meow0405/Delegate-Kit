export const unCommitteeRules: Record<string, string> = {
  unga:
    "The General Assembly considers the full range of international issues under the UN Charter. Resolutions are generally recommendatory, with procedural votes decided by simple majority and important questions by two-thirds majority.",
  unsc:
    "The Security Council has primary responsibility for international peace and security. Substantive decisions require nine affirmative votes and no veto from a permanent member.",
  ecosoc:
    "ECOSOC coordinates economic, social, humanitarian, and development work across UN bodies. Delegates should emphasize implementation partnerships, indicators, and sustainable financing.",
  unhrc:
    "The Human Rights Council addresses human rights situations, thematic mandates, Universal Periodic Review follow-up, and special procedures while balancing scrutiny, cooperation, and capacity building.",
  who:
    "WHO committees focus on global health standards, surveillance, emergency response, technical assistance, and equitable access to medicines, vaccines, and resilient health systems.",
  unep:
    "UNEP debates environmental governance, climate resilience, biodiversity, pollution, and implementation of multilateral environmental agreements through science-led and finance-aware language.",
  disec:
    "DISEC handles disarmament and international security questions. Strong draft language usually distinguishes verification, confidence-building measures, arms control, and state security concerns.",
  unodc:
    "UNODC work centers on drugs, crime, corruption, terrorism prevention, border cooperation, and criminal justice capacity building, with attention to rights safeguards.",
  unwomen:
    "UN Women committees focus on gender equality, women's political and economic participation, protection from gender-based violence, and implementation of international commitments such as CEDAW and the Beijing Platform for Action.",
  unicef:
    "UNICEF debates child protection, education, health, nutrition, humanitarian response, and child rights implementation. Strong policy language should be rights-based, child-sensitive, and operationally realistic.",
  undp:
    "UNDP addresses sustainable development, poverty reduction, democratic governance, crisis recovery, climate resilience, and capacity building through practical country-level implementation frameworks.",
  unesco:
    "UNESCO committees cover education, culture, science, heritage protection, media freedom, and knowledge access. Delegates should balance preservation, equity, technology, and national cultural priorities.",
  iaea:
    "IAEA focuses on nuclear safety, safeguards, non-proliferation, peaceful nuclear technology, and technical cooperation. Debate should distinguish verification, safety standards, and peaceful-use assistance.",
  wto:
    "WTO simulations focus on trade rules, dispute settlement, market access, subsidies, development concerns, and global supply chains. Delegates should use precise trade language and coalition-aware concessions.",
  nato:
    "NATO committees debate collective security, deterrence, crisis response, interoperability, defense spending, cyber defense, and partnerships. Positions should reflect alliance consensus and security commitments.",
  specpol:
    "SPECPOL addresses decolonization, peacekeeping, special political missions, territorial disputes, and self-determination questions with emphasis on sovereignty and international stability.",
  sochum:
    "SOCHUM covers social, humanitarian, and cultural issues including human rights, refugees, minorities, education, and social development. Resolutions should be inclusive and implementation-focused.",
  ecofin:
    "ECOFIN debates macroeconomic stability, debt, trade and development finance, illicit financial flows, technology, and sustainable growth. Strong drafts pair fiscal realism with development priorities.",
  unctad:
    "UNCTAD focuses on trade and development, investment, digital economy, commodities, debt, and South-South cooperation, especially from the perspective of developing economies.",
  ipcc:
    "IPCC-style committees assess climate science, adaptation, mitigation, loss and damage, and policy pathways. Delegates should distinguish scientific findings from negotiated policy recommendations.",
  hcc:
    "Historical Crisis Committees use portfolio powers, directives, communiques, and real-time crisis updates. Delegates should act within historical context while responding quickly to evolving events.",
  ccc:
    "Continuous Crisis Committees are dynamic simulations using portfolio powers, directives, press releases, and crisis arcs. Strategy depends on fast coordination, secrecy, and clear short-term objectives.",
  loksabha:
    "Lok Sabha simulations model India's lower house of Parliament. Debate centers on bills, motions, questions, party positions, constituency interests, parliamentary procedure, and majority-building.",
  aippm:
    "AIPPM, the All India Political Parties Meet, is an Indian committee for cross-party political negotiation. Delegates represent party leaders and debate national issues through party ideology, coalition strategy, and media-aware consensus building.",
};

export const committeeOptions = [
  { id: "unga", name: "UN General Assembly" },
  { id: "unsc", name: "Security Council" },
  { id: "ecosoc", name: "ECOSOC" },
  { id: "unhrc", name: "Human Rights Council" },
  { id: "unwomen", name: "UN Women" },
  { id: "unicef", name: "UNICEF" },
  { id: "undp", name: "UNDP" },
  { id: "unesco", name: "UNESCO" },
  { id: "who", name: "WHO" },
  { id: "unep", name: "UNEP" },
  { id: "disec", name: "DISEC" },
  { id: "specpol", name: "SPECPOL" },
  { id: "sochum", name: "SOCHUM" },
  { id: "ecofin", name: "ECOFIN" },
  { id: "unodc", name: "UNODC" },
  { id: "iaea", name: "IAEA" },
  { id: "wto", name: "WTO" },
  { id: "unctad", name: "UNCTAD" },
  { id: "ipcc", name: "IPCC" },
  { id: "nato", name: "NATO" },
  { id: "hcc", name: "Historical Crisis Committee" },
  { id: "ccc", name: "Continuous Crisis Committee" },
  { id: "loksabha", name: "Lok Sabha" },
  { id: "aippm", name: "AIPPM" },
];

export function getCommitteeRule(idOrName: string) {
  const normalized = idOrName.toLowerCase().replace(/[^a-z]/g, "");
  const match = committeeOptions.find(
    (committee) =>
      committee.id === normalized ||
      committee.name.toLowerCase().replace(/[^a-z]/g, "").includes(normalized) ||
      normalized.includes(committee.id),
  );

  return match ? unCommitteeRules[match.id] : "Use the committee mandate, voting rules, and dais-specific procedure as the controlling frame for strategy.";
}
