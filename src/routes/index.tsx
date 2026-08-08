import { createFileRoute } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LemScoreProvider, useLemScore } from "@/lib/lemscore/store";
import { CampaignShell } from "@/components/lemscore/campaign-shell";
import { SequenceScreen } from "@/components/lemscore/sequence-screen";
import { ProspectListScreen } from "@/components/lemscore/prospect-list-screen";
import { LaunchScreen } from "@/components/lemscore/launch-screen";
import { PerformanceScreen } from "@/components/lemscore/performance-screen";
import { CohortValidationTable } from "@/components/lemscore/cohort-validation-table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "lemScore beta — predictive outreach scoring in lemlist" },
      {
        name: "description",
        content:
          "lemScore predicts and explains how well every fixed outreach message fits its assigned audience, using workspace outcomes and prospect signals.",
      },
      { property: "og:title", content: "lemScore beta — predictive outreach scoring" },
      {
        property: "og:description",
        content:
          "Score, predict and diagnose the commercial fit of fixed outreach messages across email, LinkedIn and scripts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <LemScoreProvider>
      <TooltipProvider delayDuration={200}>
        <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface font-sans text-foreground">
          <CampaignShell />
          <main className="min-h-0 flex-1 overflow-auto bg-surface">
            <Screens />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </LemScoreProvider>
  );
}

function Screens() {
  const { mainTab, lemScoreEnabled, lemScoreEntitled } = useLemScore();
  if (mainTab === "sequence") return <SequenceScreen />;
  if (mainTab === "prospects") return <ProspectListScreen />;
  if (mainTab === "launch") return <LaunchScreen />;
  return (
    <>
      <PerformanceScreen />
      {lemScoreEnabled && lemScoreEntitled && <CohortValidationTable />}
    </>
  );
}
