import { hasContent, round1, round2, selectComparableBenchmark } from "./benchmarks";
import { campaignModelProspect, workspaceHistory } from "./data";
import {
  aggregateMessageScore as baseAggregateMessageScore,
  aggregateProspectSequenceScore as baseAggregateProspectSequenceScore,
  aggregateVariantSequenceScore as baseAggregateVariantSequenceScore,
  recalibrateAfterOutcomes,
  scoreBand,
} from "./scoring";
import type {
  Prospect,
  ProspectContext,
  ScoreFactor,
  ScoreResult,
  SequenceStep,
} from "./types";

export { recalibrateAfterOutcomes };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scaleRate(rate: number, multiplier: number, precision: 1 | 2) {
  return precision === 1 ? round1(rate * multiplier) : round2(rate * multiplier);
}

function campaignSegmentFactor(step: SequenceStep, context: ProspectContext): ScoreFactor {
  const benchmark = selectComparableBenchmark({
    channel: step.channel,
    personaGroup: context.personaGroup,
    position: step.position,
    industry: context.industry,
    companySizeBand: context.companySizeBand,
  });
  const neutralBenchmark = selectComparableBenchmark({
    channel: step.channel,
    personaGroup: context.personaGroup,
    position: step.position,
    industry: "Marketing",
    companySizeBand: "51-200",
  });
  const ratio =
    benchmark.baselinePositiveRate / Math.max(0.1, neutralBenchmark.baselinePositiveRate);
  const contribution = clamp(Math.round((ratio - 1) * 18), -9, 9);

  return {
    label: "Historical ICP segment fit",
    contribution,
    observed: `${context.persona} · ${context.industry} · ${context.companySizeBand}.`,
    benchmark: `For the same channel, persona family and sequence position, comparable ${context.industry} / ${context.companySizeBand} campaigns show a ${benchmark.baselinePositiveRate}% positive-reply baseline versus ${neutralBenchmark.baselinePositiveRate}% for the neutral demo reference segment.`,
    source: "Campaign ICP + lemlist benchmark patterns",
    sampleSize: benchmark.comparableMessages,
    confidence: benchmark.confidence,
  };
}

function geographyMatches(target: string, actual: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const t = normalize(target);
  const a = normalize(actual);
  if (!t || !a) return false;
  if (t.includes(a) || a.includes(t)) return true;
  if ((t.includes("uk") || t.includes("united kingdom")) && (a.includes("uk") || a.includes("united kingdom"))) {
    return true;
  }
  const benelux = ["belgium", "netherlands", "luxembourg"];
  if (t.includes("benelux") && benelux.some((country) => a.includes(country))) return true;
  return false;
}

const SIZE_ORDER: ProspectContext["companySizeBand"][] = [
  "1-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

function campaignIcpAlignmentFactor(
  prospect: Prospect,
  target: ProspectContext,
): ScoreFactor {
  const exactPersona = prospect.context.persona.toLowerCase() === target.persona.toLowerCase();
  const samePersonaGroup = prospect.context.personaGroup === target.personaGroup;
  const personaPoints = exactPersona ? 7 : samePersonaGroup ? 3 : -7;

  const industryPoints =
    prospect.context.industry.toLowerCase() === target.industry.toLowerCase() ? 6 : -5;

  const prospectSize = SIZE_ORDER.indexOf(prospect.context.companySizeBand);
  const targetSize = SIZE_ORDER.indexOf(target.companySizeBand);
  const sizeDistance = Math.abs(prospectSize - targetSize);
  const sizePoints = sizeDistance === 0 ? 5 : sizeDistance === 1 ? 2 : -5;

  const signalPoints =
    target.signal.type === "none"
      ? 0
      : prospect.context.signal.type === target.signal.type
        ? 4
        : -3;

  const geoPoints = geographyMatches(target.geography, prospect.context.geography) ? 3 : -2;
  const raw = personaPoints + industryPoints + sizePoints + signalPoints + geoPoints;
  const contribution = clamp(Math.round(raw * 0.6), -14, 15);

  return {
    label: "Campaign ICP fit",
    contribution,
    observed: `${prospect.context.persona} · ${prospect.context.industry} · ${prospect.context.companySizeBand} · ${prospect.context.geography} · ${prospect.context.signal.label}.`,
    benchmark: `Campaign ICP: ${target.persona} · ${target.industry} · ${target.companySizeBand} · ${target.geography} · priority signal: ${target.signal.label}.`,
    source: "Campaign ICP selected before Sequence",
    sampleSize: 1,
    confidence: "High",
  };
}

/**
 * Reactive message-level score used by the MVP. The base engine evaluates copy,
 * channel, position, timing and the current Campaign ICP. This wrapper adds a
 * visible historical segment-fit adjustment so changing industry/company size
 * can also move an already-written message score.
 */
export function aggregateMessageScore(
  step: SequenceStep,
  variantProspects: Prospect[] = [],
): ReturnType<typeof baseAggregateMessageScore> {
  const base = baseAggregateMessageScore(step, variantProspects);
  if (base.validity !== "valid") return base;

  const segmentFactor = campaignSegmentFactor(step, campaignModelProspect.context);
  const score = clamp(base.score + segmentFactor.contribution, 0, 96);
  const rateMultiplier = clamp(score / Math.max(1, base.score), 0.78, 1.22);
  const band = scoreBand(score);

  return {
    ...base,
    score,
    band,
    prediction: {
      ...base.prediction,
      positiveReplyRate: scaleRate(base.prediction.positiveReplyRate, rateMultiplier, 1),
      opportunityRate: scaleRate(base.prediction.opportunityRate, rateMultiplier, 2),
    },
    factors: [segmentFactor, ...base.factors].slice(0, 10),
    calibrationSource: `${base.calibrationSource} · Campaign ICP segment adjustment`,
    distribution: {
      strong: band === "strong" ? 100 : 0,
      medium: band === "medium" ? 100 : 0,
      weak: band === "weak" ? 100 : 0,
    },
  };
}

/**
 * Full-sequence prospect prediction. The base model scores the exact prospect
 * against every message. We then add explicit fit to the Campaign ICP so an
 * ICP change immediately reshuffles the individual scores in Prospect list.
 */
export function aggregateProspectSequenceScore(
  steps: SequenceStep[],
  prospect: Prospect,
): ReturnType<typeof baseAggregateProspectSequenceScore> {
  const base = baseAggregateProspectSequenceScore(steps, prospect);
  if (base.validity !== "valid") return base;

  const icpFactor = campaignIcpAlignmentFactor(prospect, campaignModelProspect.context);
  const score = clamp(base.score + icpFactor.contribution, 0, 96);
  const rateMultiplier = clamp(score / Math.max(1, base.score), 0.72, 1.28);

  return {
    ...base,
    score,
    band: scoreBand(score),
    prediction: {
      ...base.prediction,
      positiveReplyRate: scaleRate(base.prediction.positiveReplyRate, rateMultiplier, 1),
      opportunityRate: scaleRate(base.prediction.opportunityRate, rateMultiplier, 2),
    },
    factors: [icpFactor, ...base.factors.slice(0, 7)],
    calibrationSource: `${base.calibrationSource} · individual fit adjusted against Campaign ICP`,
  };
}

/** Sequence score rebuilt from the reactive Campaign-ICP-aware message scores. */
export function aggregateVariantSequenceScore(
  steps: SequenceStep[],
  variantProspects: Prospect[],
): ReturnType<typeof baseAggregateVariantSequenceScore> {
  const base = baseAggregateVariantSequenceScore(steps, variantProspects);
  if (base.validity !== "valid") return base;

  const content = steps.filter((step) => hasContent(step.channel) && step.hasContent);
  const results = content.map((step) => aggregateMessageScore(step, variantProspects));
  if (!results.length || results.some((result) => result.validity !== "valid")) return base;

  const average = (select: (result: ScoreResult) => number) =>
    results.reduce((sum, result) => sum + select(result), 0) / results.length;
  const score = Math.round(average((result) => result.score));
  const counts = { strong: 0, medium: 0, weak: 0 };
  results.forEach((result) => {
    counts[result.band] += 1;
  });
  const representative = results.reduce((best, result) =>
    Math.abs(result.score - score) < Math.abs(best.score - score) ? result : best,
  );
  const total = results.length;

  return {
    ...base,
    ...representative,
    score,
    band: scoreBand(score),
    validity: "valid",
    validityReason: undefined,
    audienceSize: 0,
    prediction: {
      positiveReplyRate: round1(average((result) => result.prediction.positiveReplyRate)),
      opportunityRate: round2(average((result) => result.prediction.opportunityRate)),
      workspaceBaselineRate: workspaceHistory.baselinePositiveRate,
    },
    comparableMessages: Math.round(average((result) => result.comparableMessages)),
    calibrationSource: `Mean of ${total} Campaign-ICP-aware message optimization scores`,
    distribution: {
      strong: Math.round((counts.strong / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      weak: Math.round((counts.weak / total) * 100),
    },
  };
}
