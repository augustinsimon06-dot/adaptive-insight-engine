# lemScore beta

lemScore is a working product prototype for a predictive outreach feature inside lemlist.

Instead of giving every email a generic writing or deliverability grade, lemScore estimates the commercial fit between an exact fixed message and the prospects who will receive it.

## Product thesis

For each prospect, the model combines:

- the assigned message: angle, tone, length, CTA, channel and sequence position;
- the prospect: persona, company, industry, size and intent signals;
- the sender workspace: historical campaign performance and CRM outcomes;
- comparable lemlist messages and their labelled outcomes: positive replies, qualified opportunities, Closed Won and Closed Lost.

The score shown on a message node is the mean of the personalized predictions for every prospect assigned to that A/B variant. It is not a generic copywriting score. Each prospect still receives exactly one fixed variant, and lemScore never rewrites a message or changes the A/B split automatically.

## Campaign workflow

1. **Prospect list** — inspect every campaign member, sort or filter by personalized lemScore, and open the explanation for an individual prediction.
2. **Sequence** — edit the fixed A/B messages in a lemlist-style automation canvas and see the audience prediction update live.
3. **Launch** — select the final send queue, review both variants and freeze the prediction snapshot used for evaluation.
4. **Performance** — compare the launch prediction, the current edited prediction and the actual positive-reply and opportunity outcomes.

The prototype preserves the native lemlist tab order — Sequence, Prospect list, Launch, Performance — while keeping this underlying product logic explicit.

## Beta safeguards

- Empty, incomplete or obvious keyboard-noise content returns `0 — Insufficient content`; it never inherits an arbitrary neutral score.
- A campaign without prospects returns `0 — Add prospects`; no fictional fallback audience is scored.
- Sequence, Launch and Performance use the same deterministic scoring service and the same audience membership.
- Launch snapshots are immutable, so later edits cannot rewrite the original prediction.
- All scores and outcomes are clearly labelled demo data. The beta sends no real messages.

## Prototype capabilities

- lemlist-style visual sequence canvas for email, LinkedIn and wait steps;
- fixed A/B assignment with one variant per prospect;
- live message × audience prediction and strong/medium/weak distribution;
- per-prospect whole-sequence prediction, explanation drawer, sorting and filtering;
- explicit launch selection and frozen prediction snapshots;
- performance comparison between current prediction, launch prediction and actual outcome;
- local persistence and one-click demo reset;
- responsive React UI with accessible dialogs, hover explanations and keyboard-focus states.

## Technical stack

- React 19 + TypeScript
- TanStack Start / Router / Query
- Vite 8
- Tailwind CSS 4
- Radix UI primitives
- Local deterministic scoring and versioned `localStorage` state

No backend, external API, authentication or real lemlist data is used in this beta.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run build
npm run lint
```

<!-- lovable-sync-trigger: 2026-08-08T03:07+02:00 -->
