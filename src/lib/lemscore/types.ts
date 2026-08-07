export type OutreachChannel =
  | "email"
  | "linkedin_invite"
  | "linkedin_message"
  | "call_script"
  | "voice_note"
  | "video_note"
  | "sms"
  | "wait"
  | "profile_visit";

export type VariantId = "A" | "B";

export type Confidence = "Low" | "Medium" | "High";

export type PersonaGroup = "revenue_leader" | "enablement";

export type ScoreBand = "strong" | "medium" | "weak";

export type SequenceStep = {
  id: string;
  variant: VariantId;
  channel: OutreachChannel;
  /** 1-based position among content-bearing steps of the variant */
  position: number;
  label: string;
  timing: string;
  hasContent: boolean;
  subject?: string | undefined;
  body?: string | undefined;
};

export type SequenceVariant = {
  id: VariantId;
  name: string;
  steps: SequenceStep[];
};

export type Campaign = {
  id: string;
  name: string;
  status: "Draft" | "Active";
  sender: { name: string; email: string };
  schedule: string;
  abTest: boolean;
  variants: SequenceVariant[];
};

export type IntentSignal = {
  type:
    | "sales_hiring"
    | "leadership_change"
    | "funding"
    | "tech_adoption"
    | "content_activity"
    | "none";
  label: string;
  strength: "strong" | "moderate" | "none";
};

export type ProspectContext = {
  persona: string;
  personaGroup: PersonaGroup;
  industry: string;
  companySizeBand: "1-50" | "51-200" | "201-500" | "501-1000" | "1000+";
  geography: string;
  signal: IntentSignal;
  growth: string;
  technologies: string[];
  publicActivity: string;
};

export type Prospect = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  company: string;
  jobTitle: string;
  email: string;
  variant: VariantId;
  status: "Not started" | "In sequence" | "Replied" | "Meeting booked" | "Excluded" | "Moved";
  context: ProspectContext;
};

export type BenchmarkProfile = {
  key: string;
  channel: OutreachChannel;
  personaGroup: PersonaGroup;
  positionBand: "first_touch" | "follow_up";
  preferredLength: [number, number];
  preferredSubjectLength?: [number, number] | undefined;
  toneTraits: string[];
  effectivePains: string[];
  preferredProof: string;
  preferredCta: string;
  relevantTriggers: IntentSignal["type"][];
  baselinePositiveRate: number;
  baselineOpportunityRate: number;
  comparableMessages: number;
  confidence: Confidence;
};

export type WorkspaceHistory = {
  campaigns: number;
  positiveReplies: number;
  meetings: number;
  opportunities: number;
  closedWon: number;
  closedLost: number;
  baselinePositiveRate: number;
  baselineOpportunityRate: number;
  maturity: "cold_start" | "calibrated";
};

export type MessageFeatures = {
  wordCount: number;
  subjectLength: number;
  questionCount: number;
  personalizationVars: number;
  outcomeLanguage: number;
  painLanguage: number;
  triggerLanguage: number;
  proofSignals: number;
  ctaType: "soft_question" | "hard_ask" | "none";
  spamRisks: string[];
  toneTraits: string[];
};

export type ScoreFactor = {
  label: string;
  contribution: number;
  observed: string;
  benchmark: string;
  source: string;
  sampleSize: number;
  confidence: Confidence;
};

export type Prediction = {
  positiveReplyRate: number;
  opportunityRate: number;
  workspaceBaselineRate: number;
};

export type ScoreResult = {
  score: number;
  band: ScoreBand;
  prediction: Prediction;
  confidence: Confidence;
  comparableMessages: number;
  factors: ScoreFactor[];
  calibrationSource: string;
};

export type CampaignOutcome = {
  variant: VariantId;
  sends: number;
  actualPositiveRate: number;
  actualOpportunityRate: number;
  meetings: number;
  opportunities: number;
  closedWon: number;
  closedLost: number;
};

export type ScoreSnapshot = {
  score: number;
  predictedPositiveRate: number;
  predictedOpportunityRate: number;
  confidence: Confidence;
  capturedAt: string;
};
