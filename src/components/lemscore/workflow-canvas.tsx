import { Clock, Eye, Linkedin, Mail, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { baseCampaign } from "@/lib/lemscore/data";
import { useLemScore } from "@/lib/lemscore/store";
import type { OutreachChannel, SequenceStep, VariantId } from "@/lib/lemscore/types";
import { DemoBadge, InfoPopover, ScorePill } from "./shared";

function ChannelIcon({ channel }: { channel: OutreachChannel }) {
  const classes = "h-4 w-4";
  if (channel === "email") return <Mail className={classes} aria-hidden="true" />;
  if (channel === "wait") return <Clock className={classes} aria-hidden="true" />;
  if (channel === "profile_visit") return <Eye className={classes} aria-hidden="true" />;
  return <Linkedin className={classes} aria-hidden="true" />;
}

function channelName(step: SequenceStep) {
  if (step.channel === "email") return "Email";
  if (step.channel === "wait") return "Wait";
  if (step.channel === "profile_visit") return "LinkedIn profile visit";
  if (step.channel === "linkedin_message") return "LinkedIn message";
  return step.label.split("·")[1]?.trim() ?? step.label;
}

export function WorkflowCanvas({
  variant,
  steps,
  selectedId,
  onSelect,
  prospectCount,
  showContent = false,
  className,
  onAddStep,
}: {
  variant: VariantId;
  steps: SequenceStep[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  prospectCount: number;
  showContent?: boolean;
  className?: string;
  onAddStep?: () => void;
}) {
  const { messageScore } = useLemScore();

  return (
    <div
      className={cn("min-h-full overflow-y-auto bg-surface px-5 py-5", className)}
      style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1.1px, transparent 1.1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col items-center pb-8",
          showContent ? "max-w-[760px]" : "max-w-[390px]",
        )}
      >
        <div className="mb-2 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
          Sequence {variant} · {prospectCount} prospects
        </div>

        <div
          className={cn(
            "rounded-xl border border-border bg-background p-3 shadow-sm",
            showContent ? "w-[62%] min-w-80" : "w-[86%]",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-lem text-xs font-semibold text-white">
              {baseCampaign.sender.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-muted-foreground">Sender</div>
              <div className="truncate text-sm font-medium">{baseCampaign.sender.name}</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-[11px] text-muted-foreground">Schedule</div>
              <div className="text-sm font-medium">Paris</div>
            </div>
          </div>
        </div>

        {steps.map((step) => {
          const result = step.hasContent ? messageScore(step.id) : null;
          const selected = selectedId === step.id;
          return (
            <div key={step.id} className="flex w-full flex-col items-center">
              <div className="h-5 w-px bg-border" aria-hidden="true" />
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddStep?.();
                }}
                aria-label={`Add a step before ${channelName(step)}`}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <div className="h-5 w-px bg-border" aria-hidden="true" />

              <article
                tabIndex={onSelect ? 0 : undefined}
                role={onSelect ? "button" : undefined}
                aria-current={selected ? "step" : undefined}
                onClick={() => onSelect?.(step.id)}
                onKeyDown={(event) => {
                  if (onSelect && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onSelect(step.id);
                  }
                }}
                className={cn(
                  "w-full overflow-hidden rounded-xl border bg-background text-left shadow-sm transition-all",
                  selected
                    ? "border-2 border-primary shadow-md"
                    : "border-border hover:border-primary/50",
                  onSelect &&
                    "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                )}
              >
                <div className="flex min-h-11 items-center gap-2 border-b border-border px-3 py-2">
                  <span className="text-xs font-semibold text-primary">{step.timing}</span>
                  {result ? (
                    <div
                      className="ml-auto flex items-center gap-1.5"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Message score
                      </span>
                      <ScorePill score={result.score} validity={result.validity} suffix={false} />
                      <InfoPopover>
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            Message Optimization Score · Sequence {variant}
                          </p>
                          {result.validity !== "valid" ? (
                            <p>{result.validityReason}</p>
                          ) : (
                            <>
                              <p>
                                Exact {channelName(step).toLowerCase()} · content position{" "}
                                {step.position} · {step.timing.toLowerCase()}.
                              </p>
                              <p>Confidence: {result.confidence}</p>
                              <p>
                                Predicted positive replies: {result.prediction.positiveReplyRate}%
                              </p>
                              <p>Predicted opportunities: {result.prediction.opportunityRate}%</p>
                              <p>
                                Individual prospect fit is calculated separately in Prospect list.
                              </p>
                            </>
                          )}
                          <DemoBadge className="mt-1" />
                        </div>
                      </InfoPopover>
                    </div>
                  ) : (
                    <span className="ml-auto text-[10px] text-muted-foreground">No score</span>
                  )}
                </div>

                <div className="flex items-center gap-3 px-3 py-3">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                      step.channel === "email" && "bg-success-soft text-success",
                      step.channel === "linkedin_message" && "bg-primary/10 text-primary",
                      step.channel === "wait" && "bg-warning-soft text-warning",
                      step.channel === "profile_visit" && "bg-lem-soft text-lem",
                    )}
                  >
                    <ChannelIcon channel={step.channel} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{channelName(step)}</span>
                      {step.hasContent && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Users className="h-3 w-3" aria-hidden="true" /> {prospectCount}
                        </span>
                      )}
                    </div>
                    {showContent && step.subject && (
                      <p className="mt-1 truncate text-xs font-medium">{step.subject}</p>
                    )}
                    {showContent && step.body && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    )}
                    {!step.hasContent && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Automation action · no message content
                      </p>
                    )}
                  </div>
                </div>
              </article>
            </div>
          );
        })}

        <div className="h-5 w-px bg-border" aria-hidden="true" />
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-dashed bg-background"
          onClick={onAddStep}
        >
          <Plus className="h-4 w-4" /> Add a step
        </Button>
      </div>
    </div>
  );
}
