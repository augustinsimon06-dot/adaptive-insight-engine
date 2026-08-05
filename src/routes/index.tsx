import { createFileRoute } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "@/lib/app-state";
import { CampaignHeader } from "@/components/lem/campaign-header";
import { SequenceBuilder } from "@/components/lem/sequence-builder";
import { ProspectListTab } from "@/components/lem/prospect-list";
import { PerformanceTab } from "@/components/lem/performance-tab";
import { LaunchTab } from "@/components/lem/launch-tab";
import { EvidenceDrawer } from "@/components/lem/evidence-drawer";
import { CompareAudiencesModal } from "@/components/lem/compare-audiences";
import { SettingsModal } from "@/components/lem/settings-modal";
import { AnalysisFlow } from "@/components/lem/analysis-flow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adaptive Challenger — lemlist campaign prototype" },
      {
        name: "description",
        content:
          "Interactive prototype of Adaptive Challenger: turn Closed Won and Closed Lost outcomes into a new targeting and messaging hypothesis inside the campaign builder.",
      },
      { property: "og:title", content: "Adaptive Challenger — lemlist campaign prototype" },
      {
        property: "og:description",
        content:
          "Every closed-won deal teaches lemlist who to target and what to say next. Clickable demo-data prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppProvider>
      <TooltipProvider delayDuration={200}>
        <div className="min-h-screen bg-surface font-sans text-foreground">
          <CampaignHeader />
          <main>
            <Screens />
          </main>
          <EvidenceDrawer />
          <CompareAudiencesModal />
          <SettingsModal />
          <AnalysisFlow />
          <Toaster />
        </div>
      </TooltipProvider>
    </AppProvider>
  );
}

function Screens() {
  const { mainTab } = useApp();
  if (mainTab === "sequence") return <SequenceBuilder />;
  if (mainTab === "prospects") return <ProspectListTab />;
  if (mainTab === "launch") return <LaunchTab />;
  return <PerformanceTab />;
}
