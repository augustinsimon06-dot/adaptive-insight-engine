# Adaptive Insight Engine

Build a polished, fully clickable SaaS prototype for a new lemlist feature called “Adaptive Challenger”.

VISUAL REFERENCE

Use the attached screenshot of the real lemlist campaign builder as the main visual reference.

The prototype must feel like a native feature added directly inside the existing lemlist campaign interface.

Do not create a separate generic AI dashboard.

Closely reproduce the visible interface structure:

- campaign name in the top-left;

- campaign status badge;

- Save button;

- top navigation tabs:

  - Sequence

  - Prospect list

  - Launch

  - Performance;

- sequence builder canvas on the left;

- connected campaign steps;

- email editor on the right;

- sender selector;

- email subject field;

- email body editor;

- preview and settings controls;

- white and light-gray backgrounds;

- rounded cards;

- subtle borders;

- dark typography;

- blue primary buttons;

- clean and spacious B2B SaaS design.

Use generic icons when necessary. Do not depend on external lemlist assets.

Use English throughout the interface.

PRODUCT CONCEPT

Traditional A/B testing compares different messages or sequence variations using prospects from the same campaign audience.

Adaptive Challenger adds a new type of experiment.

After enough CRM deals receive a final outcome, such as Closed Won or Closed Lost, the system analyzes the campaign results and proposes a new commercial hypothesis.

The system can analyze:

- Closed Won deals;

- Closed Lost deals;

- company characteristics;

- company size;

- industry;

- buyer persona;

- intent signals;

- company growth;

- hiring activity;

- technologies used;

- campaign messages;

- positive and negative replies;

- sales-call insights;

- campaign channels and sequence structure.

It then proposes:

- a refined target audience;

- a new prospect list;

- a priority buyer persona;

- stronger intent criteria;

- a new messaging angle;

- an improved sequence.

The system does not automatically replace or launch an active campaign.

Every change must be explained and approved by the user.

MAIN PROMISE

“Every closed-won deal teaches lemlist who to target and what to say next.”

IMPORTANT PRODUCT DISTINCTION

Sequence A and Sequence B are traditional campaign variations.

They use the same current prospect audience and test different messages or sequence structures.

Adaptive Challenger can change both:

- who is targeted;

- what is said.

Adaptive Challenger is therefore not simply a third email variation.

It represents a new commercial hypothesis generated from actual sales outcomes.

MOCK DATA REQUIREMENTS

This is a prototype only.

Create one coherent fictional demo campaign and generate realistic fictional data for it.

All numbers, findings, prospects, companies, contacts and statistics must come from one central local mock-data object so that they remain consistent across all screens.

Clearly display the label:

“Demo data”

Do not present any specific company size, persona, intent signal or number as a universal rule.

The findings must be generated as results from the fictional campaign data.

The interface should make clear that another campaign would produce different recommendations.

No backend.

No Supabase.

No external API.

No authentication.

Use local mock state only.

Every important button, tab, modal and navigation action must work.

CAMPAIGN HEADER

Reproduce the campaign header visible in the screenshot.

Include:

Campaign name:

“Sales Onboarding Campaign”

Status:

Active

Actions:

- Favorite icon

- Settings icon

- More-options icon

- Save button

- Close icon

MAIN NAVIGATION

Add these tabs:

- Sequence

- Prospect list

- Launch

- Performance

The Sequence tab is active when the prototype opens.

SCREEN 1 — SEQUENCE BUILDER

Inside the Sequence tab, create three sequence tabs:

- Sequence A

- Sequence B

- Adaptive Challenger ✦

Sequence A and Sequence B should visually match the layout from the attached screenshot.

The left side should contain a visual campaign sequence:

- sender and schedule card;

- first email step;

- connected vertical line;

- add-step button.

The right side should contain the email editor:

- step type: Email;

- sender assignment;

- subject field;

- message editor;

- add-variable controls;

- preview button;

- automated/manual selector;

- settings icon.

SEQUENCE A

Use a fictional current email generated from the mock campaign data.

Add a small label:

“Current control”

SEQUENCE B

Use the same campaign audience as Sequence A but display a different email variation.

Add a small label:

“Message variation — same audience”

ADAPTIVE CHALLENGER TAB

The Adaptive Challenger tab must be visually integrated beside Sequence A and Sequence B.

Add a small AI sparkle icon.

When selected, display the same sequence-builder and email-editor layout.

At the top of the right editor, add a highlighted information banner:

“Adaptive Challenger generated from the latest Closed Won and Closed Lost patterns.”

Below it, display:

“Demo data”

Add two links:

- View supporting evidence

- Compare audiences

Add an audience badge:

“Uses Adaptive audience”

The Adaptive Challenger email must use a different messaging hypothesis derived from the fictional campaign findings.

Below the email editor, add a section:

“Why this version was recommended”

Display several dynamic reasons derived from the mock data, such as:

- stronger intent signal detected;

- different priority persona;

- narrower company profile;

- pain point found more frequently in successful outcomes;

- more relevant CTA;

- different campaign timing or sequence structure.

Do not hardcode these examples as universal rules.

Generate findings that match the fictional campaign data.

VIEW SUPPORTING EVIDENCE

Clicking “View supporting evidence” opens a right-side drawer.

Drawer title:

“Evidence behind the Adaptive Challenger”

Display:

- number of Closed Won deals analyzed;

- number of Closed Lost deals analyzed;

- campaign replies analyzed;

- sales conversations analyzed;

- CRM fields used.

Show four finding cards dynamically generated from the mock data.

Possible categories:

- Company profile

- Buyer persona

- Intent signal

- Messaging angle

- Channel

- Sequence timing

Each card must contain:

- finding title;

- observed pattern;

- supporting demo statistic;

- confidence level;

- information tooltip.

Add this warning:

“These patterns show correlations in the available demo data. They do not prove why an individual deal was won or lost.”

Add a button:

“Review full analysis”

This navigates to the Adaptive Analysis flow described below.

COMPARE AUDIENCES

Clicking “Compare audiences” opens a modal.

The modal must compare:

CURRENT AUDIENCE

Show the campaign’s current:

- industry criteria;

- company-size criteria;

- personas;

- intent signals;

- geographical criteria;

- available prospect count.

ADAPTIVE AUDIENCE

Show the system’s recommended:

- industry criteria;

- company-size criteria;

- priority persona;

- intent signals;

- growth or hiring indicators;

- geographical criteria;

- new matching prospect count.

The exact values must come from the fictional demo dataset.

Add an explanation:

“The Adaptive audience is a recommendation generated from the latest campaign and CRM outcomes. It must be tested before replacing the current targeting strategy.”

Buttons:

- Keep current audience

- Review Adaptive audience

PROSPECT LIST TAB

When the user clicks “Prospect list”, reproduce a lemlist-style prospect-list interface.

Add two subtabs:

- Current audience

- Adaptive audience ✦

CURRENT AUDIENCE

Display the prospects currently assigned to Sequence A and Sequence B.

Use a realistic table with fictional information.

Columns:

- Name

- Company

- Job title

- Industry

- Company size

- Intent signal

- Email status

- Campaign status

ADAPTIVE AUDIENCE

Display the new prospects generated for the Adaptive Challenger.

Add a banner:

“Prospects selected from the latest Closed Won and Closed Lost patterns.”

Display:

“Demo data”

Columns:

- Name

- Company

- Job title

- Industry

- Company size

- Intent signal

- Fit score

- Why selected

- Verification status

Generate fictional company names and contacts.

Do not use real people or real companies.

Add filters:

- Industry

- Company size

- Persona

- Intent signal

- Fit score

- Location

Add buttons:

- Compare audiences

- Review selection logic

- Approve audience draft

Clicking “Review selection logic” opens a drawer explaining which criteria were used and how they relate to the fictional findings.

ADAPTIVE ANALYSIS FLOW

Create a complete clickable analysis flow accessible from:

- View supporting evidence;

- a notification in the Performance tab;

- an “Adaptive analysis” button.

STEP 1 — LEARNING CYCLE AVAILABLE

Display a native lemlist-style modal or page.

Title:

“New Adaptive Cycle available”

Text:

“Your campaign now has enough new CRM outcomes to generate another targeting and messaging hypothesis.”

Show dynamically generated demo totals for:

- Closed Won;

- Closed Lost;

- qualified opportunities;

- positive replies;

- analyzed conversations.

Add:

“Demo data”

Primary button:

“Start analysis”

Secondary button:

“Not now”

STEP 2 — ANALYSIS IN PROGRESS

Show an animated progress interface.

Analysis stages:

1. Importing final CRM outcomes

2. Comparing Closed Won and Closed Lost profiles

3. Analyzing buyer personas

4. Identifying intent signals

5. Reviewing replies and messages

6. Reviewing available sales-call insights

7. Generating an Adaptive hypothesis

Use a progress bar.

After a short simulated delay, display:

“Analysis complete”

Button:

“View findings”

STEP 3 — FINDINGS

Title:

“What this campaign taught us”

Display findings dynamically generated from the fictional mock dataset.

Do not use fixed universal findings.

Each finding must contain:

- category;

- observation;

- supporting statistic;

- confidence level;

- data source.

Possible data sources:

- CRM outcomes

- Campaign replies

- Prospect data

- Sales-call transcripts

- Campaign performance

Add a warning card:

“These findings identify patterns and correlations. They do not guarantee that the recommended changes will improve future results.”

Buttons:

- Ignore this cycle

- Build Adaptive Challenger

STEP 4 — COMMERCIAL HYPOTHESIS

Title:

“Current strategy vs Adaptive hypothesis”

Display two large comparison columns.

CURRENT STRATEGY

Show dynamically:

- current audience;

- current personas;

- current intent criteria;

- current message angle;

- current sequence;

- current prospect count.

ADAPTIVE HYPOTHESIS

Show dynamically:

- recommended audience;

- recommended priority persona;

- recommended intent criteria;

- recommended message angle;

- recommended sequence changes;

- new matching prospect count.

Add this explanation:

“The Adaptive Challenger tests a different combination of audience, intent and messaging. It is not only another email version.”

Buttons:

- Keep current strategy

- Review new prospects

STEP 5 — REVIEW NEW PROSPECTS

Display the Adaptive audience table.

Allow the user to:

- select or deselect prospects;

- use filters;

- inspect the fit score;

- open the “Why selected” explanation;

- approve the audience draft.

Button:

“Review Adaptive sequence”

STEP 6 — REVIEW ADAPTIVE SEQUENCE

Return to the campaign-builder interface with the Adaptive Challenger tab selected.

Show:

- new audience badge;

- new message;

- supporting reasons;

- evidence drawer;

- editable subject;

- editable email body.

Add a button:

“Create Adaptive experiment”

STEP 7 — EXPERIMENT SETUP

Title:

“Create an Adaptive experiment”

Clearly separate the two experiment types.

TRADITIONAL A/B TEST

Sequence A:

- Current audience

- Control message

Sequence B:

- Same current audience

- Alternative message

ADAPTIVE CHALLENGER

- Adaptive audience

- Refined targeting criteria

- New persona priority

- New intent hypothesis

- Adaptive message and sequence

Add this explanation:

“Sequence A and Sequence B compare messaging within the same audience. Adaptive Challenger evaluates a different audience-and-message hypothesis and must be analyzed separately.”

Display configurable success metrics:

- Positive reply rate

- Qualified opportunity rate

- Meeting-booked rate

- Closed Won rate

Add controls:

- Require human approval before launch: ON

- Automatically replace current strategy: OFF

- Notify when enough results are available: ON

- Start another Adaptive Cycle after a configurable number of new final CRM outcomes: ON

Do not impose one fixed trigger number.

Add a field where the user can choose the trigger threshold.

Example label:

“Start a new learning cycle after: [user-selected number] additional final outcomes”

Buttons:

- Cancel

- Create experiment drafts

STEP 8 — CONFIRMATION

Open a confirmation modal:

“Create experiment drafts?”

Text:

“No email will be sent automatically. The prospect lists and sequence variations will remain drafts until final review and launch.”

Buttons:

- Cancel

- Create drafts

STEP 9 — SUCCESS

Display a success state inside the native lemlist interface.

Title:

“Adaptive experiment created”

Text:

“Your current sequences and Adaptive Challenger are ready for final review.”

Display dynamic summary cards:

- Current-audience prospects

- Adaptive-audience prospects

- Sequence variations

- Human approval status

- Next learning-cycle trigger

Buttons:

- Open experiment

- Return to campaign

PERFORMANCE TAB

Create a lemlist-style campaign performance page.

Do not incorrectly combine all three sequences into one simple A/B comparison.

Create two sections.

SECTION 1 — CURRENT AUDIENCE A/B TEST

Compare:

- Sequence A

- Sequence B

Metrics:

- Delivered

- Positive replies

- Meetings

- Opportunities

- Closed Won

SECTION 2 — ADAPTIVE CHALLENGER

Analyze the Adaptive Challenger separately because it uses a different audience.

Show:

- audience definition;

- prospects contacted;

- positive replies;

- qualified opportunities;

- Closed Won;

- comparison with the historical campaign baseline.

Add a notice:

“Because the Adaptive Challenger uses a different audience, its results should be interpreted as a commercial-hypothesis test rather than a message-only A/B test.”

Add a prominent card:

“Next Adaptive Cycle”

Show:

- new final outcomes collected;

- progress toward the user-defined trigger;

- button: “Run analysis now”.

LAUNCH TAB

Create a review page before campaign launch.

Display:

- Sequence A status

- Sequence B status

- Adaptive Challenger status

- Current audience status

- Adaptive audience status

- sender configuration

- schedule

- approval requirements

The user must be able to launch:

- only the traditional A/B campaign;

- only the Adaptive Challenger;

- both experiments separately.

Never launch automatically.

PRIVACY AND NETWORK DATA

Include an optional setting:

“Use anonymized lemlist network benchmarks”

Default state:

OFF

When enabled, explain:

“Only anonymized and aggregated performance patterns are used. Other companies’ identities, prospects, exact messages and private campaign strategies are never displayed.”

Do not make network data necessary for the core feature.

The system must work first with the company’s own:

- campaign data;

- CRM outcomes;

- prospect data;

- replies;

- sales conversations.

SETTINGS

Add an Adaptive Challenger settings modal.

Options:

- Learning-cycle trigger

- Data sources used

- CRM outcomes

- Campaign replies

- Prospect data

- Sales-call insights

- Anonymized network benchmarks

- Human approval

- Notifications

- Automatic campaign replacement

Automatic campaign replacement must remain OFF and display a warning if the user tries to enable it.

FINAL UX REQUIREMENTS

- Every navigation tab must work.

- Every major button must work.

- Every modal and drawer must open and close.

- Add back navigation where appropriate.

- Preserve the user’s progress between screens.

- Add subtle hover states.

- Add smooth transitions.

- Add loading states.

- Add tooltips for:

  - Confidence

  - Fit score

  - Intent signal

  - Adaptive Challenger

  - Network benchmark

- Use realistic fictional demo data.

- Keep all mock values consistent throughout the prototype.

- Label all fictional statistics as “Demo data”.



- Do not add unrelated CRM, inbox, billing or account-management features.

- The prototype must look like Adaptive Challenger was added directly inside the existing lemlist campaign builder shown in the attached screenshot.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bf74b007-30e8-470e-b137-cb75c9ef52b1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
