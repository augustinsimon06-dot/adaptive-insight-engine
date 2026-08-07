import { Eye, Linkedin, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { baseCampaign } from "@/lib/lemscore/data";
import { useLemScore } from "@/lib/lemscore/store";
import type { Prospect, SequenceStep } from "@/lib/lemscore/types";

function mergeVariables(text: string, prospect: Prospect) {
  return text
    .replaceAll("{{firstName}}", prospect.firstName)
    .replaceAll("{{companyName}}", prospect.company)
    .replaceAll("{{industry}}", prospect.context.industry)
    .replaceAll("{{senderSignature}}", baseCampaign.sender.name);
}

export function MessagePreviewDialog({ step }: { step: SequenceStep }) {
  const { prospectsFor } = useLemScore();
  const prospect = prospectsFor(step.variant)[0];

  if (!prospect || !step.hasContent) return null;

  const subject = mergeVariables(step.subject ?? "", prospect);
  const body = mergeVariables(step.body ?? "", prospect);
  const isEmail = step.channel === "email";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" /> Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-4xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4 pr-14">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-success-soft text-success">
              {isEmail ? <Mail className="h-4 w-4" /> : <Linkedin className="h-4 w-4" />}
            </span>
            <div>
              <DialogTitle>
                {isEmail ? "Email step preview" : "LinkedIn message preview"}
              </DialogTitle>
              <DialogDescription>
                Personalized exactly as {prospect.firstName} would see this fixed Sequence{" "}
                {step.variant} message.
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() =>
                toast.success("Test message simulated", {
                  description: "Beta mode never sends a real email or LinkedIn message.",
                })
              }
            >
              <Send className="h-4 w-4" /> Send a test {isEmail ? "email" : "message"}
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto bg-surface p-6 sm:p-8">
          {isEmail ? (
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="ml-2 font-medium text-foreground">Inbox preview</span>
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold">{subject || "(No subject)"}</h3>
                <div className="mt-5 flex items-center gap-3 border-b border-border pb-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    LM
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{baseCampaign.sender.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {baseCampaign.sender.email} · to {prospect.firstName} &lt;{prospect.email}&gt;
                    </p>
                  </div>
                </div>
                <div className="min-h-64 pt-6 text-sm leading-7 whitespace-pre-line">{body}</div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
              <div className="flex items-center gap-3 border-b border-border bg-primary px-5 py-4 text-primary-foreground">
                <Linkedin className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">{prospect.name}</p>
                  <p className="text-xs opacity-80">
                    {prospect.jobTitle} · {prospect.company}
                  </p>
                </div>
              </div>
              <div className="min-h-80 bg-surface p-6">
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm">
                  {body}
                </div>
                <p className="mt-2 text-right text-[11px] text-muted-foreground">
                  Preview only · not sent
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
