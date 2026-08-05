import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { adaptiveProspects, sequences } from "./mock-data";

export type MainTab = "sequence" | "prospects" | "launch" | "performance";
export type SeqTab = "A" | "B" | "ADAPTIVE";
export type ProspectTab = "current" | "adaptive";
export type AnalysisStep = null | 1 | 2 | 3 | 4 | 5 | 7 | 9;

type Settings = {
  networkBenchmarks: boolean;
  humanApproval: boolean;
  autoReplace: boolean;
  notify: boolean;
  autoCycle: boolean;
  triggerThreshold: number;
  sourceCrm: boolean;
  sourceReplies: boolean;
  sourceProspects: boolean;
  sourceCalls: boolean;
};

type Ctx = {
  mainTab: MainTab;
  setMainTab: (t: MainTab) => void;
  seqTab: SeqTab;
  setSeqTab: (t: SeqTab) => void;
  prospectTab: ProspectTab;
  setProspectTab: (t: ProspectTab) => void;

  evidenceOpen: boolean;
  setEvidenceOpen: (v: boolean) => void;
  compareOpen: boolean;
  setCompareOpen: (v: boolean) => void;
  logicOpen: boolean;
  setLogicOpen: (v: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  confirmOpen: boolean;
  setConfirmOpen: (v: boolean) => void;

  analysisStep: AnalysisStep;
  setAnalysisStep: (s: AnalysisStep) => void;

  selectedProspects: string[];
  toggleProspect: (id: string) => void;
  audienceApproved: boolean;
  setAudienceApproved: (v: boolean) => void;
  experimentCreated: boolean;
  setExperimentCreated: (v: boolean) => void;

  subject: Record<SeqTab, string>;
  body: Record<SeqTab, string>;
  setSubject: (t: SeqTab, v: string) => void;
  setBody: (t: SeqTab, v: string) => void;

  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;

  metrics: string[];
  toggleMetric: (m: string) => void;

  launched: { ab: boolean; adaptive: boolean };
  setLaunched: (v: { ab: boolean; adaptive: boolean }) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mainTab, setMainTab] = useState<MainTab>("sequence");
  const [seqTab, setSeqTab] = useState<SeqTab>("A");
  const [prospectTab, setProspectTab] = useState<ProspectTab>("current");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [logicOpen, setLogicOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>(null);
  const [selectedProspects, setSelectedProspects] = useState<string[]>(
    adaptiveProspects.filter((p) => (p.fitScore ?? 0) >= 76).map((p) => p.id),
  );
  const [audienceApproved, setAudienceApproved] = useState(false);
  const [experimentCreated, setExperimentCreated] = useState(false);
  const [subjectState, setSubjectState] = useState<Record<SeqTab, string>>({
    A: sequences.A.subject,
    B: sequences.B.subject,
    ADAPTIVE: sequences.ADAPTIVE.subject,
  });
  const [bodyState, setBodyState] = useState<Record<SeqTab, string>>({
    A: sequences.A.body,
    B: sequences.B.body,
    ADAPTIVE: sequences.ADAPTIVE.body,
  });
  const [settings, setSettings] = useState<Settings>({
    networkBenchmarks: false,
    humanApproval: true,
    autoReplace: false,
    notify: true,
    autoCycle: true,
    triggerThreshold: 50,
    sourceCrm: true,
    sourceReplies: true,
    sourceProspects: true,
    sourceCalls: true,
  });
  const [metrics, setMetrics] = useState<string[]>([
    "Positive reply rate",
    "Qualified opportunity rate",
  ]);
  const [launched, setLaunched] = useState({ ab: false, adaptive: false });

  const value = useMemo<Ctx>(
    () => ({
      mainTab,
      setMainTab,
      seqTab,
      setSeqTab,
      prospectTab,
      setProspectTab,
      evidenceOpen,
      setEvidenceOpen,
      compareOpen,
      setCompareOpen,
      logicOpen,
      setLogicOpen,
      settingsOpen,
      setSettingsOpen,
      confirmOpen,
      setConfirmOpen,
      analysisStep,
      setAnalysisStep,
      selectedProspects,
      toggleProspect: (id) =>
        setSelectedProspects((prev) =>
          prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        ),
      audienceApproved,
      setAudienceApproved,
      experimentCreated,
      setExperimentCreated,
      subject: subjectState,
      body: bodyState,
      setSubject: (t, v) => setSubjectState((prev) => ({ ...prev, [t]: v })),
      setBody: (t, v) => setBodyState((prev) => ({ ...prev, [t]: v })),
      settings,
      updateSettings: (p) => setSettings((prev) => ({ ...prev, ...p })),
      metrics,
      toggleMetric: (m) =>
        setMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])),
      launched,
      setLaunched,
    }),
    [
      mainTab,
      seqTab,
      prospectTab,
      evidenceOpen,
      compareOpen,
      logicOpen,
      settingsOpen,
      confirmOpen,
      analysisStep,
      selectedProspects,
      audienceApproved,
      experimentCreated,
      subjectState,
      bodyState,
      settings,
      metrics,
      launched,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
