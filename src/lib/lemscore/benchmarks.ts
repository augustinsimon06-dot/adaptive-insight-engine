import type { BenchmarkProfile, IntentSignal, OutreachChannel, PersonaGroup } from "./types";

type ChannelBase = {
  length: [number, number];
  subject?: [number, number];
  tone: string[];
  pains: string[];
  proof: string;
  cta: string;
  positive: number;
  opportunity: number;
  sample: number;
};

const CHANNEL_BASE: Record<Exclude<OutreachChannel, "wait" | "profile_visit">, ChannelBase> = {
  email: {
    length: [55, 95],
    subject: [4, 9],
    tone: ["direct", "specific", "low-pressure"],
    pains: ["ramp time", "quota attainment", "pipeline coverage"],
    proof: "quantified customer outcome",
    cta: "low-friction question",
    positive: 5.4,
    opportunity: 1.7,
    sample: 18420,
  },
  linkedin_invite: {
    length: [18, 40],
    tone: ["concise", "contextual", "no pitch"],
    pains: ["relevance of the connection reason"],
    proof: "shared context",
    cta: "no CTA",
    positive: 9.1,
    opportunity: 1.2,
    sample: 6240,
  },
  linkedin_message: {
    length: [45, 80],
    tone: ["conversational", "peer-to-peer", "short paragraphs"],
    pains: ["rep ramp-up", "team productivity"],
    proof: "peer example",
    cta: "opinion or question",
    positive: 7.8,
    opportunity: 1.9,
    sample: 9310,
  },
  call_script: {
    length: [70, 130],
    tone: ["permission-based opening", "question-led", "objection-ready"],
    pains: ["time to first meeting", "onboarding cost"],
    proof: "peer benchmark",
    cta: "next-step ask",
    positive: 11.2,
    opportunity: 3.1,
    sample: 2870,
  },
  voice_note: {
    length: [40, 70],
    tone: ["natural", "warm", "under 40 seconds"],
    pains: ["ramp time"],
    proof: "single concrete example",
    cta: "reply invitation",
    positive: 8.4,
    opportunity: 2.4,
    sample: 1640,
  },
  video_note: {
    length: [45, 85],
    tone: ["personal opening", "screen context", "under 60 seconds"],
    pains: ["onboarding process"],
    proof: "visual walk-through",
    cta: "reply invitation",
    positive: 8.9,
    opportunity: 2.6,
    sample: 1210,
  },
  sms: {
    length: [12, 30],
    tone: ["brief", "non-intrusive", "identify yourself"],
    pains: ["scheduling friction"],
    proof: "none",
    cta: "yes/no question",
    positive: 6.2,
    opportunity: 1.4,
    sample: 980,
  },
};

const PERSONA_MOD: Record<
  PersonaGroup,
  { lengthFactor: number; tone: string[]; pains: string[]; proof: string; cta: string; posMod: number }
> = {
  revenue_leader: {
    lengthFactor: 0.8,
    tone: ["concise", "outcome-oriented", "direct"],
    pains: ["ramp time to first meeting", "pipeline coverage", "quota attainment"],
    proof: "revenue or ramp-time metric",
    cta: "15-minute conversation",
    posMod: 0.95,
  },
  enablement: {
    lengthFactor: 1.15,
    tone: ["explanatory", "process-oriented", "collaborative"],
    pains: ["rep ramp-up", "playbook adoption", "onboarding consistency"],
    proof: "adoption or process metric",
    cta: "share a playbook example",
    posMod: 1.1,
  },
};

const TRIGGERS_BY_PERSONA: Record<PersonaGroup, IntentSignal["type"][]> = {
  revenue_leader: ["sales_hiring", "leadership_change", "funding"],
  enablement: ["sales_hiring", "tech_adoption", "content_activity"],
};

const INDUSTRY_MOD: Record<string, number> = {
  "B2B SaaS": 1.1,
  "Financial Services": 0.85,
  Marketing: 1.0,
  Manufacturing: 0.8,
  Healthcare: 0.82,
  "IT Services": 0.95,
};

const SIZE_MOD: Record<string, number> = {
  "1-50": 1.15,
  "51-200": 1.05,
  "201-500": 0.95,
  "501-1000": 0.85,
  "1000+": 0.75,
};

export function hasContent(channel: OutreachChannel) {
  return channel !== "wait" && channel !== "profile_visit";
}

export function channelLabel(channel: OutreachChannel) {
  const map: Record<OutreachChannel, string> = {
    email: "Email",
    linkedin_invite: "LinkedIn invitation",
    linkedin_message: "LinkedIn message",
    call_script: "Call script",
    voice_note: "Voice message script",
    video_note: "Video message script",
    sms: "SMS",
    wait: "Wait",
    profile_visit: "LinkedIn profile visit",
  };
  return map[channel];
}

/** selectComparableBenchmark */
export function selectComparableBenchmark(args: {
  channel: OutreachChannel;
  personaGroup: PersonaGroup;
  position: number;
  industry: string;
  companySizeBand: string;
}): BenchmarkProfile {
  const base = CHANNEL_BASE[args.channel as keyof typeof CHANNEL_BASE] ?? CHANNEL_BASE.email;
  const persona = PERSONA_MOD[args.personaGroup];
  const positionBand = args.position <= 1 ? "first_touch" : "follow_up";
  const followUpFactor = positionBand === "follow_up" ? 0.72 : 1;
  const industryMod = INDUSTRY_MOD[args.industry] ?? 0.9;
  const sizeMod = SIZE_MOD[args.companySizeBand] ?? 0.9;

  const lo = Math.round(base.length[0] * persona.lengthFactor * followUpFactor);
  const hi = Math.round(base.length[1] * persona.lengthFactor * followUpFactor);

  const rateMod = persona.posMod * industryMod * sizeMod * (positionBand === "follow_up" ? 0.7 : 1);

  return {
    key: `${args.channel}|${args.personaGroup}|${positionBand}|${args.industry}|${args.companySizeBand}`,
    channel: args.channel,
    personaGroup: args.personaGroup,
    positionBand,
    preferredLength: [lo, hi],
    preferredSubjectLength: base.subject,
    toneTraits: [...persona.tone, ...base.tone].slice(0, 4),
    effectivePains: [...persona.pains, ...base.pains].slice(0, 3),
    preferredProof: persona.proof,
    preferredCta: args.channel === "linkedin_invite" ? base.cta : persona.cta,
    relevantTriggers: TRIGGERS_BY_PERSONA[args.personaGroup],
    baselinePositiveRate: round1(base.positive * rateMod),
    baselineOpportunityRate: round2(base.opportunity * rateMod),
    comparableMessages: Math.round(base.sample * (positionBand === "follow_up" ? 0.62 : 1)),
    confidence: base.sample > 8000 ? "High" : base.sample > 2000 ? "Medium" : "Low",
  };
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
