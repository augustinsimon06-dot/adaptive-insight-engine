import {
  Star,
  Settings2,
  MoreHorizontal,
  X,
  CheckCircle2,
  Workflow,
  Users,
  Send,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { campaign } from "@/lib/mock-data";
import { useApp, type MainTab } from "@/lib/app-state";
import { toast } from "sonner";

const TABS: { id: MainTab; label: string; icon: typeof Workflow }[] = [
  { id: "sequence", label: "Sequence", icon: Workflow },
  { id: "prospects", label: "Prospect list", icon: Users },
  { id: "launch", label: "Launch", icon: Send },
  { id: "performance", label: "Performance", icon: BarChart3 },
];

export function CampaignHeader() {
  const { mainTab, setMainTab, setSettingsOpen, setAnalysisStep } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Workflow className="h-4 w-4" />
        </div>
        <h1 className="text-base font-semibold text-foreground">{campaign.name}</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {campaign.status}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <IconBtn label="Favorite" onClick={() => toast("Campaign favorited")}>
            <Star className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="Campaign settings" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn label="More options" onClick={() => toast("Duplicate · Archive · Export")}>
            <MoreHorizontal className="h-4 w-4" />
          </IconBtn>
        </div>
        <Button size="sm" className="ml-1" onClick={() => toast.success("Campaign saved")}>
          Save
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-adaptive/40 text-adaptive hover:bg-adaptive-soft hover:text-adaptive"
            onClick={() => setAnalysisStep(1)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Adaptive analysis
          </Button>
          <IconBtn label="Close campaign" onClick={() => toast("Closing is disabled in the prototype")}>
            <X className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>

      <nav className="flex items-center gap-1 px-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = mainTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-t-md px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              <span
                className={cn(
                  "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-opacity",
                  active ? "bg-primary opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-md p-1.5 transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
