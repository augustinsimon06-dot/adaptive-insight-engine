import { ChevronDown, RotateCcw, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { baseCampaign } from "@/lib/lemscore/data";
import { useLemScore } from "@/lib/lemscore/store";
import { BetaBadge } from "./shared";

const TABS = [
  { id: "icp", label: "ICP" },
  { id: "sequence", label: "Sequence" },
  { id: "prospects", label: "Prospect list" },
  { id: "launch", label: "Launch" },
  { id: "performance", label: "Performance" },
] as const;

export function CampaignShell() {
  const { mainTab, update, launched, reset } = useLemScore();
  const [resetOpen, setResetOpen] = useState(false);
  const activeTab = mainTab as string;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="flex flex-wrap items-center gap-3 px-6 py-3">
          <h1 className="text-base font-semibold">{baseCampaign.name}</h1>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full text-[11px]",
              launched ? "border-success/40 bg-success-soft text-success" : "text-muted-foreground",
            )}
          >
            {launched ? "Active" : "Draft"}
          </Badge>
          <BetaBadge />
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Settings2 className="h-4 w-4" /> Options <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setResetOpen(true)}
                >
                  <RotateCcw className="h-4 w-4" /> Reset demo campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              onClick={() =>
                toast.success("Campaign saved", {
                  description: "Messages, campaign ICP and lemScore snapshots stored locally.",
                })
              }
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 px-4" aria-label="Campaign sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-current={activeTab === t.id ? "page" : undefined}
              onClick={() => update({ mainTab: t.id as never })}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                activeTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the demo campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This restores the original A/B messages, prospects, scores and pre-launch state. No
              real data is affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                reset();
                toast.success("Demo campaign reset");
              }}
            >
              Reset demo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
