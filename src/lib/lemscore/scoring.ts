import { hasContent, round1, round2, selectComparableBenchmark } from "./benchmarks";
import { workspaceHistory } from "./data";
import type {
  BenchmarkProfile,
  CampaignOutcome,
  Confidence,
  MessageFeatures,
  Prediction,
  Prospect,
  ScoreBand,
  ScoreFactor,
  ScoreResult,
  ScoreSnapshot,
  SequenceStep,
  WorkspaceHistory,
} from "./types";

type ContentValidation = {
  valid: boolean;
  reason?: string;
};

const OUTCOME_WORDS = [
  "ramp",
  "quota",
  "pipeline",
  "revenue",
  "productivity",
  "faster",
  "attainment",
  "results",
  "meetings",
];
const PAIN_WORDS = [
  "lose",
  "weeks",
  "slow",
  "struggle",
  "cost",
  "churn",
  "onboarding",
  "first meetings",
  "ramp",
];
const TRIGGER_WORDS = [
  "hiring",
  "hires",
  "expanding",
  "new reps",
  "sales team",
  "cro",
  "new leader",
  "growing",
  "recruit",
];
const SPAM_WORDS = [
  "free",
  "risk free",
  "act now",
  "limited",
  "guarantee",
  "100%",
  "!!!",
  "click here",
];
const HARD_CTA = [
  "book a demo",
  "book a call",
  "schedule a demo",
  "buy",
  "pricing call",
  "book 30 minutes",
  "run a full product demo",
];
const SOFT_CTA = [
  "would you be open",
  "worth a quick look",
  "what do you think",
  "curious",
  "happy to share",
  "how are you handling",
  "open to",
];

export function extractMessageFeatures(subject: string | undefined, body: string): MessageFeatures {
  const text = `${subject ?? ""}\n${body}`;
  const lower = text.toLowerCase();
  const words = body.trim().split(/\s+/).filter(Boolean);
  const count = (list: string[]) => list.filter((w) => lower.includes(w)).length;
  const spamRisks = SPAM_WORDS.filter((w) => lower.includes(w));
  const ctaType: MessageFeatures["ctaType"] = HARD_CTA.some((c) => lower.includes(c))
    ? "hard_ask"
    : SOFT_CTA.some((c) => lower.includes(c))
      ? "soft_question"
      : "none";

  const toneTraits: string[] = [];
  if (words.length <= 80) toneTraits.push("concise");
  else toneTraits.push("explanatory");
  if ((body.match(/\?/g) ?? []).length > 0) toneTraits.push("conversational");
  if (count(OUTCOME_WORDS) >= 2) toneTraits.push("outcome-oriented");
  if (/we (help|give|built|provide)/i.test(body)) toneTraits.push("vendor-centric");

  return {
    wordCount: words.length,
    subjectLength: subject ? subject.trim().split(/\s+/).filter(Boolean).length : 0,
    questionCount: (body.match(/\?/g) ?? []).length,
    personalizationVars:
      (body.match(/{{\s*\w+\s*}}/g) ?? []).length + (subject?.match(/{{\s*\w+\s*}}/g) ?? []).length,
    outcomeLanguage: count(OUTCOME_WORDS),
    painLanguage: count(PAIN_WORDS),
    triggerLanguage: count(TRIGGER_WORDS),
    proofSignals: (text.match(/\b\d+(\.\d+)?%?\b/g) ?? []).length,
    ctaType,
    spamRisks,
    toneTraits,
  };
}

/**
 * A commercial prediction is only meaningful once there is an actual message to evaluate.
 * Merge variables do not count as copy, and obvious keyboard noise must never inherit the
 * neutral 50-point starting score.
 */
export function validateMessageContent(step: SequenceStep): ContentValidation {
  const clean = (value: string | undefined) =>
    (value ?? "")
      .replace(/{{[^}]+}}/g, " ")
      .replace(/https?:\/\/\S+/gi, " link ")
      .replace(/[^\p{L}\p{N}'’-]+/gu, " ")
      .trim();
  const body = clean(step.body);
  const subject = clean(step.subject);
  const tokens = body.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];
  const letterTokens = tokens.filter((token) => /\p{L}/u.test(token));
  const letters = letterTokens.join("").replace(/[^\p{L}]/gu, "");
  const vowelCount = (letters.match(/[aeiouyàâäéèêëïîôöùûüÿœ]/gi) ?? []).length;
  const vowelRatio = letters.length ? vowelCount / letters.length : 0;
  const suspiciousLongToken = letterTokens.some((token) => {
    const normalized = token.replace(/[^\p{L}]/gu, "");
    const vowels = (normalized.match(/[aeiouyàâäéèêëïîôöùûüÿœ]/gi) ?? []).length;
    return normalized.length >= 9 && vowels / normalized.length < 0.18;
  });

  if (!body) return { valid: false, reason: "Add a message before requesting a prediction." };
  if (step.channel === "email" && !subject) {
    return { valid: false, reason: "Add an email subject before requesting a prediction." };
  }
  if (letterTokens.length < 3) {
    return {
      valid: false,
      reason: "Add at least one complete sentence so the outcome model has enough signal.",
    };
  }
  if (letters.length >= 9 && (vowelRatio < 0.14 || suspiciousLongToken)) {
    return {
      valid: false,
      reason: "The current text does not contain enough meaningful language to predict an outcome.",
    };
  }
  return { valid: true };
}

export function calculateConfidence(sampleSize: number, workspace: WorkspaceHistory): Confidence {
  if (workspace.maturity === "cold_start") return sampleSize > 8000 ? "Medium" : "Low";
  if (sampleSize >= 8000 && workspace.opportunities >= 40) return "High";
  if (sampleSize >= 2000) return "Medium";
  return "Low";
}

export function calculatePredictedRates(
  score: number,
  benchmark: BenchmarkProfile,
  workspace: WorkspaceHistory,
): Prediction {
  const multiplier = 0.5 + (score / 100) * 1.1;
  const blend = workspace.maturity === "calibrated" ? 0.6 : 0.15;
  const basePositive =
    benchmark.baselinePositiveRate * (1 - blend) +
    workspace.baselinePositiveRate * blend * (benchmark.baselinePositiveRate / 5);
  const baseOpportunity =
    benchmark.baselineOpportunityRate * (1 - blend) +
    workspace.baselineOpportunityRate * blend * (benchmark.baselineOpportunityRate / 1.7);
  return {
    positiveReplyRate: round1(basePositive * multiplier),
    opportunityRate: round2(baseOpportunity * multiplier),
    workspaceBaselineRate: workspace.baselinePositiveRate,
  };
}

export function scoreBand(score: number): ScoreBand {
  return score >= 80 ? "strong" : score >= 60 ? "medium" : "weak";
}

export function bandLabel(score: number) {
  const b = scoreBand(score);
  return b === "strong" ? "Strong fit" : b === "medium" ? "Medium fit" : "Weak fit";
}

/** explainScoreFactors + scoreMessageForProspect */
export function scoreMessageForProspect(step: SequenceStep, prospect: Prospect): ScoreResult {
  const benchmark = selectComparableBenchmark({
    channel: step.channel,
    personaGroup: prospect.context.personaGroup,
    position: step.position,
    industry: prospect.context.industry,
    companySizeBand: prospect.context.companySizeBand,
  });
  const f = extractMessageFeatures(step.subject, step.body ?? "");
  const sample = benchmark.comparableMessages;
  const confidence = calculateConfidence(sample, workspaceHistory);
  const source =
    workspaceHistory.maturity === "calibrated"
      ? "lemlist benchmark + workspace history"
      : "lemlist benchmark (anonymized patterns)";
  const validation = validateMessageContent(step);
  if (!validation.valid) {
    return {
      score: 0,
      band: "weak",
      validity: "insufficient_content",
      validityReason: validation.reason,
      audienceSize: 1,
      prediction: {
        positiveReplyRate: 0,
        opportunityRate: 0,
        workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
      },
      confidence: "Low",
      comparableMessages: 0,
      factors: [],
      calibrationSource: "Prediction paused until the message contains enough usable content",
    };
  }
  const factors: ScoreFactor[] = [];
  const add = (
    label: string,
    contribution: number,
    observed: string,
    benchmarkText: string,
    conf: Confidence = confidence,
  ) =>
    factors.push({
      label,
      contribution: Math.round(contribution),
      observed,
      benchmark: benchmarkText,
      source,
      sampleSize: sample,
      confidence: conf,
    });

  /* Length */
  const [lo, hi] = benchmark.preferredLength;
  let lengthDelta = 0;
  if (f.wordCount < lo) lengthDelta = -Math.min(12, Math.round((lo - f.wordCount) / 3));
  else if (f.wordCount > hi) lengthDelta = -Math.min(16, Math.round((f.wordCount - hi) / 4));
  else lengthDelta = 6;
  add(
    "Length for this persona and channel",
    lengthDelta,
    `Current message: ${f.wordCount} words.`,
    `Comparable ${benchmark.positionBand === "first_touch" ? "first-touch" : "follow-up"} ${channelWord(step.channel)} for ${prospect.context.persona} in ${prospect.context.industry} performed better between ${lo} and ${hi} words.`,
  );

  /* Persona & tone fit */
  const wantsConcise = prospect.context.personaGroup === "revenue_leader";
  const isConcise = f.toneTraits.includes("concise");
  let toneDelta = wantsConcise === isConcise ? 8 : -7;
  if (f.toneTraits.includes("vendor-centric")) toneDelta -= 4;
  if (f.toneTraits.includes("outcome-oriented") && wantsConcise) toneDelta += 3;
  if (!wantsConcise && f.toneTraits.includes("explanatory")) toneDelta += 3;
  add(
    "Persona and tone fit",
    toneDelta,
    `Detected tone: ${f.toneTraits.join(", ") || "neutral"}.`,
    `${prospect.context.persona} responded better to ${benchmark.toneTraits.join(", ")}.`,
  );

  /* Trigger relevance */
  const signalRelevant = benchmark.relevantTriggers.includes(prospect.context.signal.type);
  const usesTrigger = f.triggerLanguage > 0;
  let triggerDelta = 0;
  if (signalRelevant && usesTrigger)
    triggerDelta = prospect.context.signal.strength === "strong" ? 9 : 6;
  else if (signalRelevant && !usesTrigger) triggerDelta = -6;
  else if (!signalRelevant && usesTrigger) triggerDelta = -4;
  add(
    "Trigger relevance",
    triggerDelta,
    usesTrigger
      ? `The message references recruitment / growth activity. Prospect signal: ${prospect.context.signal.label}.`
      : `The message uses no contextual trigger. Prospect signal: ${prospect.context.signal.label}.`,
    signalRelevant
      ? "Comparable messages using this signal created more qualified opportunities."
      : "This persona rarely converts on this trigger type; comparable messages relied on other context.",
    prospect.context.signal.strength === "strong" ? confidence : "Medium",
  );

  /* Pain-point relevance */
  const painDelta = f.painLanguage >= 2 ? 6 : f.painLanguage === 1 ? 2 : -5;
  add(
    "Pain-point relevance",
    painDelta,
    `${f.painLanguage} pain-point reference${f.painLanguage === 1 ? "" : "s"} detected.`,
    `Effective pains for this segment: ${benchmark.effectivePains.join(", ")}.`,
  );

  /* Value proposition fit */
  const valueDelta = f.outcomeLanguage >= 3 ? 7 : f.outcomeLanguage >= 1 ? 3 : -6;
  add(
    "Value-proposition fit",
    valueDelta,
    `${f.outcomeLanguage} outcome-oriented expression${f.outcomeLanguage === 1 ? "" : "s"} detected.`,
    `Comparable messages framed value as ${benchmark.preferredProof}.`,
  );

  /* Proof relevance */
  const proofDelta = f.proofSignals >= 1 ? (f.proofSignals > 4 ? 2 : 6) : -4;
  add(
    "Proof relevance",
    proofDelta,
    f.proofSignals
      ? `${f.proofSignals} numeric proof element(s) present.`
      : "No numeric proof element.",
    `Preferred proof for this segment: ${benchmark.preferredProof}.`,
  );

  /* CTA fit */
  const wantsSoft =
    benchmark.positionBand === "first_touch" || prospect.context.personaGroup === "revenue_leader";
  let ctaDelta = 0;
  if (f.ctaType === "none") ctaDelta = -6;
  else if (f.ctaType === "soft_question") ctaDelta = wantsSoft ? 8 : 4;
  else ctaDelta = wantsSoft ? -8 : 1;
  add(
    "CTA fit",
    ctaDelta,
    `CTA detected: ${f.ctaType === "none" ? "none" : f.ctaType === "soft_question" ? "low-friction question" : "direct demo/meeting ask"}.`,
    `Comparable messages converted best with a ${benchmark.preferredCta}.`,
  );

  /* Contextual personalization */
  const persDelta = f.personalizationVars >= 2 ? 5 : f.personalizationVars === 1 ? 1 : -5;
  add(
    "Contextual personalization",
    persDelta,
    `${f.personalizationVars} personalization variable(s) used.`,
    "Comparable messages used at least two contextual variables (company, first name, industry or signal).",
  );

  /* Deliverability (email only) */
  if (step.channel === "email") {
    const subjLen = f.subjectLength;
    const [slo, shi] = benchmark.preferredSubjectLength ?? [4, 9];
    let delivDelta = subjLen >= slo && subjLen <= shi ? 4 : -3;
    delivDelta -= f.spamRisks.length * 3;
    add(
      "Deliverability",
      delivDelta,
      `Subject: ${subjLen} words. ${f.spamRisks.length ? `Risk terms: ${f.spamRisks.join(", ")}.` : "No spam-risk term detected."}`,
      `Comparable subjects ran ${slo}–${shi} words with no promotional trigger words.`,
    );
  }

  /*
   * Contributions are diagnostic deltas, not percentages.  The previous
   * implementation started at 68 and added every delta at full value, which
   * pushed nearly every credible message to 99–100. A neutral message now
   * starts at 50 and evidence moves it gradually in either direction.
   */
  const evidenceDelta = factors.reduce((s, x) => s + x.contribution, 0);
  const score = Math.max(0, Math.min(96, Math.round(50 + evidenceDelta * 0.8)));
  const prediction = calculatePredictedRates(score, benchmark, workspaceHistory);

  return {
    score,
    band: scoreBand(score),
    validity: "valid",
    audienceSize: 1,
    prediction,
    confidence,
    comparableMessages: sample,
    factors,
    calibrationSource:
      workspaceHistory.maturity === "calibrated"
        ? `Calibrated on ${workspaceHistory.campaigns} workspace campaigns and ${workspaceHistory.opportunities} qualified opportunities`
        : "Based on lemlist benchmarks",
  };
}

function channelWord(channel: SequenceStep["channel"]) {
  return channel === "email"
    ? "emails"
    : channel === "linkedin_message"
      ? "LinkedIn messages"
      : "messages";
}

/** aggregateMessageScore — one fixed message across all prospects of its variant */
export function aggregateMessageScore(
  step: SequenceStep,
  variantProspects: Prospect[],
): ScoreResult & {
  distribution: { strong: number; medium: number; weak: number };
} {
  const results = variantProspects.map((p) => scoreMessageForProspect(step, p));
  if (results.length === 0) {
    return {
      score: 0,
      band: "weak",
      validity: "audience_unavailable",
      validityReason: "Add prospects to this campaign to calculate an audience prediction.",
      audienceSize: 0,
      prediction: {
        positiveReplyRate: 0,
        opportunityRate: 0,
        workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
      },
      confidence: "Low",
      comparableMessages: 0,
      factors: [],
      calibrationSource: "Audience prediction unavailable",
      distribution: { strong: 0, medium: 0, weak: 0 },
    };
  }
  const invalid = results.find((result) => result.validity !== "valid");
  if (invalid) {
    return {
      ...invalid,
      audienceSize: results.length,
      distribution: { strong: 0, medium: 0, weak: 0 },
    };
  }
  const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
  const reference = results.reduce(
    (best, r) => (Math.abs(r.score - avg) < Math.abs(best.score - avg) ? r : best),
    results[0]!,
  );
  const groupedFactors = new Map<string, ScoreFactor[]>();
  results.forEach((result) => {
    result.factors.forEach((factor) => {
      const group = groupedFactors.get(factor.label) ?? [];
      group.push(factor);
      groupedFactors.set(factor.label, group);
    });
  });
  const factors = Array.from(groupedFactors.entries())
    .map(([label, group]) => {
      const representative = group.reduce((best, factor) =>
        Math.abs(factor.contribution) > Math.abs(best.contribution) ? factor : best,
      );
      return {
        ...representative,
        label,
        contribution: Math.round(
          group.reduce((sum, factor) => sum + factor.contribution, 0) / group.length,
        ),
        sampleSize: Math.round(
          group.reduce((sum, factor) => sum + factor.sampleSize, 0) / group.length,
        ),
      };
    })
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const counts = { strong: 0, medium: 0, weak: 0 };
  results.forEach((r) => {
    counts[r.band] += 1;
  });
  const total = results.length;
  return {
    ...reference,
    score: avg,
    band: scoreBand(avg),
    validity: "valid",
    audienceSize: total,
    factors,
    prediction: {
      positiveReplyRate: round1(
        results.reduce((s, r) => s + r.prediction.positiveReplyRate, 0) / total,
      ),
      opportunityRate: round2(
        results.reduce((s, r) => s + r.prediction.opportunityRate, 0) / total,
      ),
      workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
    },
    distribution: {
      strong: Math.round((counts.strong / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      weak: Math.round((counts.weak / total) * 100),
    },
  };
}

/** aggregateProspectSequenceScore — full fixed sequence assigned to one prospect */
export function aggregateProspectSequenceScore(
  steps: SequenceStep[],
  prospect: Prospect,
): ScoreResult {
  const content = steps.filter((s) => hasContent(s.channel) && s.hasContent);
  const results = content.map((s) => scoreMessageForProspect(s, prospect));
  if (!results.length) {
    return {
      score: 0,
      band: "weak",
      validity: "insufficient_content",
      validityReason: "This sequence has no message-bearing step to evaluate.",
      audienceSize: 1,
      prediction: {
        positiveReplyRate: 0,
        opportunityRate: 0,
        workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
      },
      confidence: "Low",
      comparableMessages: 0,
      factors: [],
      calibrationSource: "Prediction unavailable",
    };
  }
  // first touch weighs more than follow-ups
  const weights = content.map((s) => (s.position <= 1 ? 2 : 1));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const score = Math.round(results.reduce((s, r, i) => s + r.score * weights[i]!, 0) / weightSum);
  const factors = results
    .flatMap((r, i) =>
      r.factors.map((f) => ({
        ...f,
        label: `${f.label} · ${content[i]!.label.split("·")[1]?.trim() ?? ""}`,
      })),
    )
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 8);
  const first = results[0]!;
  return {
    score,
    band: scoreBand(score),
    validity: results.some((result) => result.validity === "valid")
      ? "valid"
      : "insufficient_content",
    validityReason: results.every((result) => result.validity !== "valid")
      ? "Every message-bearing step needs usable content before launch."
      : undefined,
    audienceSize: 1,
    prediction: {
      positiveReplyRate: round1(
        results.reduce((s, r) => s + r.prediction.positiveReplyRate, 0) / results.length,
      ),
      opportunityRate: round2(
        results.reduce((s, r) => s + r.prediction.opportunityRate, 0) / results.length,
      ),
      workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
    },
    confidence: first.confidence,
    comparableMessages: Math.round(
      results.reduce((s, r) => s + r.comparableMessages, 0) / results.length,
    ),
    factors,
    calibrationSource: first.calibrationSource,
  };
}

/**
 * Whole-sequence audience prediction. This is the single source used by Sequence summaries,
 * the launch snapshot and Performance. It is the average of the personalized predictions for
 * every prospect assigned to the variant — never an unrelated generic writing score.
 */
export function aggregateVariantSequenceScore(
  steps: SequenceStep[],
  variantProspects: Prospect[],
): ScoreResult & { distribution: { strong: number; medium: number; weak: number } } {
  if (!variantProspects.length) {
    return {
      score: 0,
      band: "weak",
      validity: "audience_unavailable",
      validityReason: "Add prospects to this campaign to calculate an audience prediction.",
      audienceSize: 0,
      prediction: {
        positiveReplyRate: 0,
        opportunityRate: 0,
        workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
      },
      confidence: "Low",
      comparableMessages: 0,
      factors: [],
      calibrationSource: "Audience prediction unavailable",
      distribution: { strong: 0, medium: 0, weak: 0 },
    };
  }

  const results = variantProspects.map((prospect) =>
    aggregateProspectSequenceScore(steps, prospect),
  );
  const validResults = results.filter((result) => result.validity === "valid");
  if (!validResults.length) {
    return {
      ...results[0]!,
      score: 0,
      band: "weak",
      audienceSize: results.length,
      distribution: { strong: 0, medium: 0, weak: 0 },
    };
  }

  const average = (select: (result: ScoreResult) => number) =>
    validResults.reduce((sum, result) => sum + select(result), 0) / validResults.length;
  const score = Math.round(average((result) => result.score));
  const counts = { strong: 0, medium: 0, weak: 0 };
  results.forEach((result) => {
    counts[result.band] += 1;
  });
  const representative = validResults.reduce((best, result) =>
    Math.abs(result.score - score) < Math.abs(best.score - score) ? result : best,
  );
  const total = results.length;

  return {
    ...representative,
    score,
    band: scoreBand(score),
    validity: "valid",
    validityReason:
      validResults.length < results.length
        ? `${results.length - validResults.length} prospect prediction(s) are waiting for complete message content.`
        : undefined,
    audienceSize: total,
    prediction: {
      positiveReplyRate: round1(average((result) => result.prediction.positiveReplyRate)),
      opportunityRate: round2(average((result) => result.prediction.opportunityRate)),
      workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
    },
    comparableMessages: Math.round(average((result) => result.comparableMessages)),
    distribution: {
      strong: Math.round((counts.strong / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      weak: Math.round((counts.weak / total) * 100),
    },
  };
}

/** recalibrateAfterOutcomes */
export function recalibrateAfterOutcomes(
  snapshot: ScoreSnapshot,
  currentPredictiveScore: number,
  outcome: CampaignOutcome | null,
  minOutcomes: number,
): { score: number; trend: "up" | "down" | "flat"; explanation: string; recalibrated: boolean } {
  if (!outcome || outcome.sends < minOutcomes) {
    return {
      score: currentPredictiveScore,
      trend: "flat",
      explanation: "Not enough outcomes to recalibrate yet.",
      recalibrated: false,
    };
  }
  const positiveRatio = outcome.actualPositiveRate / Math.max(0.1, snapshot.predictedPositiveRate);
  const oppRatio =
    outcome.actualOpportunityRate / Math.max(0.05, snapshot.predictedOpportunityRate);
  const ratio = positiveRatio * 0.6 + oppRatio * 0.4;
  const score = Math.max(0, Math.min(100, Math.round(snapshot.score * (1 + 0.45 * (ratio - 1)))));
  const diff = score - snapshot.score;
  const trend = diff >= 3 ? "up" : diff <= -3 ? "down" : "flat";
  const explanation =
    trend === "up"
      ? "Results are above the initial prediction."
      : trend === "down"
        ? "Results are slightly below the initial prediction."
        : "Results match the initial prediction.";
  return { score, trend, explanation, recalibrated: true };
}
