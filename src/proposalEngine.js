const STOP_WORDS = new Set([
  "the",
  "and",
  "with",
  "that",
  "this",
  "for",
  "are",
  "you",
  "your",
  "our",
  "from",
  "have",
  "will",
  "need",
  "looking",
  "into",
  "about",
  "project",
  "work",
  "job",
  "build",
  "create",
  "want",
  "must",
  "should",
  "can",
  "able",
  "please",
  "than",
  "them",
  "they",
  "their",
]);

const TONES = ["formal", "confident", "concise"];

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractRequirements(description) {
  const lines = description
    .split(/\n|\.|;|•|- /)
    .map((line) => normalize(line))
    .filter(Boolean);

  return lines
    .filter((line) => /need|must|required|experience|deliver|build|integrate|develop/i.test(line))
    .slice(0, 8);
}

function extractKeywords(description) {
  const words = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const counts = new Map();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function extractPainPoints(description) {
  const painSignals = [
    "urgent",
    "deadline",
    "quickly",
    "asap",
    "improve",
    "fix",
    "struggling",
    "issue",
    "problem",
    "optimize",
    "faster",
  ];

  const lower = description.toLowerCase();
  return painSignals.filter((signal) => lower.includes(signal)).slice(0, 5);
}

function pricingSuggestion(requirementsCount, keywordsCount) {
  const complexity = requirementsCount * 15 + keywordsCount * 5;
  const low = Math.max(50, complexity + 80);
  const high = low + 120;
  return `$${low} - $${high}`;
}

function buildProposal({ tone, analysis, userProfile }) {
  const introByTone = {
    formal:
      "Thank you for sharing this opportunity. I can deliver a clean and dependable solution aligned to your requirements.",
    confident:
      "I can take this from brief to delivery quickly, with clear communication and production-ready quality.",
    concise:
      "I can deliver this fast, cleanly, and with minimal back-and-forth.",
  };

  const closeByTone = {
    formal:
      "If selected, I will provide a structured delivery plan and regular progress updates.",
    confident:
      "If we start now, I can move immediately into implementation and keep you updated at each milestone.",
    concise: "Ready to start right away and deliver in milestones.",
  };

  const requirementLine = analysis.requirements.length
    ? `I understand the core requirements: ${analysis.requirements.slice(0, 3).join("; ")}.`
    : "I understand the scope and can clarify details quickly before execution.";

  const keywordLine = analysis.keywords.length
    ? `Key focus areas I will prioritize include: ${analysis.keywords.slice(0, 5).join(", ")}.`
    : "I will focus on outcome-driven implementation tailored to your goals.";

  const painLine = analysis.pain_points.length
    ? `I will directly address likely pain points around ${analysis.pain_points.join(", ")}.`
    : "I will make sure the final delivery is reliable, maintainable, and easy to extend.";

  const profileLine = userProfile
    ? `Relevant background: ${normalize(userProfile)}.`
    : "";

  const shortPitch = `${introByTone[tone]} ${keywordLine}`;

  const proposal = [
    introByTone[tone],
    requirementLine,
    keywordLine,
    painLine,
    profileLine,
    closeByTone[tone],
  ]
    .filter(Boolean)
    .join("\n\n");

  return { tone, short_pitch: shortPitch, proposal };
}

function generateProposalPack({
  jobDescription,
  requestedTone = "confident",
  userProfile = "",
  includePricing = true,
}) {
  const analysis = {
    requirements: extractRequirements(jobDescription),
    keywords: extractKeywords(jobDescription),
    pain_points: extractPainPoints(jobDescription),
  };

  const selectedTone = TONES.includes(requestedTone) ? requestedTone : "confident";
  const allTones = [selectedTone, ...TONES.filter((tone) => tone !== selectedTone)];

  const generated = allTones.map((tone) =>
    buildProposal({
      tone,
      analysis,
      userProfile,
    })
  );

  const priced = includePricing
    ? pricingSuggestion(analysis.requirements.length, analysis.keywords.length)
    : undefined;

  return {
    analysis,
    primary: {
      ...generated[0],
      pricing_suggestion: priced,
    },
    variants: generated.slice(1).map((variant) => ({
      ...variant,
      pricing_suggestion: priced,
    })),
  };
}

module.exports = {
  TONES,
  generateProposalPack,
};
