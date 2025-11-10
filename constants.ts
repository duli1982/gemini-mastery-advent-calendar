import type { CalendarDay } from './types';

export const CALENDAR_DAYS: CalendarDay[] = [
  {
    day: 1,
    name: "Elf Mode JD",
    emoji: "🎅",
    whatItDoes: "Creates a fast, scannable job brief for busy hiring managers.",
    whenToUse: "Right after you receive a new req or when preparing for an intake.",
    prompt:
      "Act as a recruiting elf. Summarize this Job Description into 5 bullet lines:\n- Must-have skills\n- Nice-to-have\n- Top 3 outcomes in 6 months\n- Interview focus\n- 1-sentence pitch\nKeep it practical.\n\n[PASTE JD]",
    proTips: [
      "Use within 24 hours of receiving a new req.",
      "Share the output in your intake prep doc.",
      "Perfect for roles you’re less familiar with."
    ]
  },
  {
    day: 2,
    name: "Candy Cane Intake Call",
    emoji: "🍬",
    whatItDoes: "Builds a 20-minute intake script with discovery, risks, calibration, and RACI.",
    whenToUse: "Before the first intake or when a role goes off-track.",
    prompt:
      "Create a 20-minute intake call script for this role. Include discovery questions, risk flags, calibration checks, and a simple RACI. End with a concise 'Christmas bow' recap.\n\n[PASTE JD + CONTEXT]",
    proTips: [
      "Timebox to 20 minutes to keep momentum.",
      "End with clear owner + due date on next steps.",
      "Save as a template for similar roles."
    ]
  },
  {
    day: 3,
    name: "Snowflake Boolean/NL Generator",
    emoji: "❄️",
    whatItDoes: "Generates EU-ready Boolean strings, NL searches, and skill/title synonyms.",
    whenToUse: "When starting sourcing or refreshing a stale search.",
    prompt:
      "Generate: (1) three Boolean strings for EU sources, (2) three natural-language searches, (3) twenty skill synonyms and adjacent titles. Return as a table.\n\n[ROLE + TARGET GEO]",
    proTips: [
      "Run each Boolean in at least two platforms.",
      "Test NL queries in Google + niche sites.",
      "Add synonyms to a reusable Sheet library."
    ]
  },
  {
    day: 4,
    name: "Mistletoe Micro-Emails",
    emoji: "💌",
    whatItDoes: "Creates three ultra-short, casual outreach emails with subjects and CTAs.",
    whenToUse: "Cold outreach or re-engaging passive candidates.",
    prompt:
      "Rewrite this outreach in a casual, concise tone (3–4 sentences), include light humor, two subject lines, and a clear CTA. Provide three variants.\n\n[PASTE YOUR DRAFT]",
    proTips: [
      "Mirror candidate’s language from their profile.",
      "One clear CTA > multiple options.",
      "Schedule send for their local morning."
    ]
  },
  {
    day: 5,
    name: "Friday Cheer Post",
    emoji: "🎉",
    whatItDoes: "Builds a LinkedIn post in SLAY + a version using the 14 ‘unwritten rules’.",
    whenToUse: "Weekly brand building and team thought leadership.",
    prompt:
      "Create a LinkedIn post using SLAY (Story, Lesson, Action, You) about [TOPIC]. Keep it punchy and end with a feel-good line. Provide a second version using the “14 unwritten rules” style.\n\n[TOPIC]",
    proTips: [
      "Open with a bold, specific hook.",
      "Use 1–2 short lines per paragraph for scannability.",
      "Finish with a question to spark comments."
    ]
  },
  {
    day: 6,
    name: "Gingerbread Q-Screen Pack",
    emoji: "🍪",
    whatItDoes: "Creates 12 screening Qs (6 technical, 6 behavioral) with scoring anchors.",
    whenToUse: "Before first candidate screens or to align interviewers.",
    prompt:
      "Build 12 screening questions (6 technical, 6 behavioral) for [ROLE]. For each, define what good looks like (score 5), acceptable (3), and concern (1). Add two Christmas-themed icebreakers.\n\n[ROLE]",
    proTips: [
      "Keep each Q tied to a competency.",
      "Use the anchors for faster/cleaner scoring.",
      "Share with interviewers to standardize."
    ]
  },
  {
    day: 7,
    name: "Stocking Stuffer Scorecard",
    emoji: "🧦",
    whatItDoes: "Outputs a CSV-friendly scorecard with competencies and hire/no-hire rubric.",
    whenToUse: "When you need consistent evaluation across panelists.",
    prompt:
      "Generate a candidate scorecard with competencies, evidence fields, and a final hire/no-hire rubric for [ROLE]. Output as a CSV-friendly table.\n\n[ROLE]",
    proTips: [
      "Limit to 6–8 competencies to avoid fatigue.",
      "Capture evidence, not opinions.",
      "Use conditional formatting in Sheets."
    ]
  },
  {
    day: 8,
    name: "Snow Plow CV Rules",
    emoji: "🛷",
    whatItDoes: "Defines dedupe rules and tagging taxonomy across systems.",
    whenToUse: "When merging pipelines or cleaning legacy data.",
    prompt:
      "Draft a tagging taxonomy and de-duplication rules for candidates across [SYSTEMS]. Include conflict resolution logic and an ‘evergreen talent’ tag set.\n\n[SYSTEMS]",
    proTips: [
      "Agree taxonomy with 2–3 example records.",
      "Document tie-breakers (email > name).",
      "Apply rules via Apps Script for speed."
    ]
  },
  {
    day: 9,
    name: "Silent Night Sync",
    emoji: "🕯️",
    whatItDoes: "Turns messy notes into decisions, owners, deadlines, and next steps.",
    whenToUse: "Post-meeting to send minutes in minutes.",
    prompt:
      "Summarize these notes into: decisions, owners, deadlines, risks, and next steps. Draft a crisp email body to the attendees.\n\n[PASTE NOTES]",
    proTips: [
      "Send within 15 minutes of the meeting.",
      "Bold owners + due dates.",
      "File in a shared Drive folder by project."
    ]
  },
  {
    day: 10,
    name: "Snow Globe TA KPI Roundup",
    emoji: "🫧",
    whatItDoes: "Builds a one-paragraph KPI narrative + bullet insights and next week focus.",
    whenToUse: "Weekly updates to HMs or leadership.",
    prompt:
      "Create a one-paragraph KPI narrative and bullet insights using these numbers. Add a ‘Next Week Focus’ and two risks.\n\n[PASTE METRICS]",
    proTips: [
      "Lead with one headline insight.",
      "Show trend vs last week, not just absolutes.",
      "Keep it under 120 words."
    ]
  },
  {
    day: 11,
    name: "Polar Express Talent Market",
    emoji: "🚂",
    whatItDoes: "Outlines likely talent signals for a role/geo without browsing.",
    whenToUse: "Pre-research to scope and plan validation steps.",
    prompt:
      "Using general knowledge (no browsing), outline likely talent signals for [ROLE, GEO]: hiring hotspots, approximate salary bands, competitor role names, and top five skills. Flag what to verify next.\n\n[ROLE, GEO]",
    proTips: [
      "Treat as hypothesis to validate Monday.",
      "Mark unknowns explicitly.",
      "Log sources to check later."
    ]
  },
  {
    day: 12,
    name: "Winnable Game Email",
    emoji: "🏒",
    whatItDoes: "Resets expectations with a kind, candid status + two options to unblock.",
    whenToUse: "When a role is blocked, stalled, or mis-scoped.",
    prompt:
      "Draft a candid, kind update to the hiring manager covering pipeline status, blockers, what we need from them, and two options to make the role ‘winnable.’ Keep it under 140 words.\n\n[PASTE PIPELINE CONTEXT]",
    proTips: [
      "Offer two clear levers (scope or speed).",
      "Ask for one action, one owner, one date.",
      "Send mid-week AM for faster replies."
    ]
  },
  {
    day: 13,
    name: "Warm Cocoa Nurture",
    emoji: "☕",
    whatItDoes: "Creates a 3-touch candidate nurture over 10 days with added value.",
    whenToUse: "After initial interest or for long-cycle roles.",
    prompt:
      "Create a three-email nurture for passive candidates over 10 days. Each email must add new value (resource, story, invite). Keep each 80–120 words.\n\n[ROLE/CONTEXT]",
    proTips: [
      "Make each touch standalone (no thread dependency).",
      "Always add something new: resource, event, POV.",
      "End with a low-friction CTA."
    ]
  },
  {
    day: 14,
    name: "Snow School Interviewer Guide",
    emoji: "🎓",
    whatItDoes: "One-pager for structured interviewing with STAR + bias guardrails.",
    whenToUse: "Before interview loops or when calibrating new panelists.",
    prompt:
      "Build a one-pager on structured interviewing for [ROLE FAMILY]. Include STAR prompts, bias guardrails, and note-taking tips. End with a 5-item checklist.\n\n[ROLE FAMILY]",
    proTips: [
      "Limit to one page to ensure use.",
      "Do a 10-minute read-through in kickoff.",
      "Attach to every interview invite."
    ]
  },
  {
    day: 15,
    name: "Ribbon Wrap Offer Enhancer",
    emoji: "🎀",
    whatItDoes: "Turns an offer into a personalized story (mission → growth path).",
    whenToUse: "After verbal alignment, pre-written offer.",
    prompt:
      "Turn this offer into a candidate-centric story: mission, impact in 90 days, growth path, manager style, and learning budget. Keep it warm and specific.\n\n[PASTE OFFER POINTS]",
    proTips: [
      "Tie back to candidate’s stated goals.",
      "Use plain language, not HR jargon.",
      "Include 1–2 concrete ‘first 30 days’ examples."
    ]
  },
  {
    day: 16,
    name: "North Star Compliance Checks",
    emoji: "⭐",
    whatItDoes: "Creates a pre-send compliance checklist + red-flag list for EMEA.",
    whenToUse: "Before mass outreach or new screening flow.",
    prompt:
      "Produce a pre-send compliance checklist for outreach and screening in EMEA (consent, data storage hints, fair wording). Add a red-flag list to avoid.",
    proTips: [
      "Localize for key markets (DE, FR, UK).",
      "Keep checklist to 8–10 items max.",
      "Park legal FAQs in a shared Doc."
    ]
  },
  {
    day: 17,
    name: "Snowball A/B Sourcing Booster",
    emoji: "⚪",
    whatItDoes: "Generates four search experiments with the ‘why’ explained.",
    whenToUse: "When your pipeline quality dips or hits saturation.",
    prompt:
      "Given this initial query, produce four experiments: title-shift, skills-cluster, seniority-pivot, adjacent industry. For each, explain the ‘why’ in one line.\n\n[PASTE QUERY]",
    proTips: [
      "Change one variable per experiment.",
      "Track results in a simple Sheet.",
      "Roll winners into your base query."
    ]
  },
  {
    day: 18,
    name: "Santa’s Route Calendar",
    emoji: "🗺️",
    whatItDoes: "Timeboxes a week into focus blocks with buffers and close-loop rituals.",
    whenToUse: "Weekly planning, especially during peak load.",
    prompt:
      "Turn these priorities into a 5-day schedule with 90-minute focus blocks, 15-minute buffers, and daily ‘close loop’ rituals.\n\n[PASTE PRIORITIES + MEETINGS]",
    proTips: [
      "Protect two AM focus blocks/day.",
      "Batch admin into a single block.",
      "End day with a 10-minute wrap."
    ]
  },
  {
    day: 19,
    name: "Snow Shovel Data Clean-Up",
    emoji: "🧹",
    whatItDoes: "Outputs Sheets formulas + Apps Script snippets for quick hygiene.",
    whenToUse: "Before reporting or when importing external candidate lists.",
    prompt:
      "Generate Google Sheets formulas/Apps Script snippets to: split full names, normalize phone numbers, dedupe by email+name, and highlight missing must-have fields. Provide step-by-step.",
    proTips: [
      "Test on a copy first.",
      "Freeze header rows and add filters.",
      "Automate repeat steps with a menu item."
    ]
  },
  {
    day: 20,
    name: "Carols & Charts Slide Deck",
    emoji: "📊",
    whatItDoes: "Creates a 10-slide leadership deck outline with one story per slide.",
    whenToUse: "Quarterly TA updates or customer QBRs.",
    prompt:
      "Create a 10-slide outline for a Q4 TA update: headline, one-insight chart cue, one story per slide, an ‘ask’ slide, and an appendix plan. Tone: confident, concise.",
    proTips: [
      "Keep one message per slide.",
      "Lead with headline, not chart.",
      "Finish with a single clear ‘ask’."
    ]
  },
  {
    day: 21,
    name: "Nutcracker Qs by Competency",
    emoji: "🪵",
    whatItDoes: "Generates behavior + scenario questions for a competency library.",
    whenToUse: "Building or refreshing your interview bank.",
    prompt:
      "For these competencies [LIST], generate three behavioral and two scenario questions each, with brief ‘what good looks like’ notes for scoring.\n\n[COMPETENCIES LIST]",
    proTips: [
      "Map questions to your scorecard fields.",
      "Rotate scenarios to reduce bias.",
      "Keep answers scoped to 3 minutes."
    ]
  },
  {
    day: 22,
    name: "Gift Wrap Chat → PDF",
    emoji: "🎁",
    whatItDoes: "Transforms chats into clean PDF summaries for records or handovers.",
    whenToUse: "After strategy threads or long Slack/Chat discussions.",
    prompt:
      "Turn these chat excerpts into a clean PDF summary with sections: Context, Key Points, Decisions, Open Questions, and Next Steps.\n\n[PASTE CHAT]",
    proTips: [
      "Export to PDF and store in project folder.",
      "Link to related docs at the top.",
      "Add owners next to each next step."
    ]
  },
  {
    day: 23,
    name: "Jingle Ping Midday Check-In",
    emoji: "🔔",
    whatItDoes: "Generates seven rotating midday reset messages for the team.",
    whenToUse: "Daily at 12:00–14:00 local to reset focus.",
    prompt:
      "Generate seven distinct ‘Midday check-in’ messages with reflection prompts, focus guidance, and a motivational line. Keep each under 60 words.",
    proTips: [
      "Schedule as Chat posts with a rotation.",
      "Keep language short and energizing.",
      "Pair with a simple 2-emoji poll."
    ]
  },
  {
    day: 24,
    name: "Tree Lights AI Maturity Score",
    emoji: "🎄",
    whatItDoes: "Self-scores the team on AI maturity and prescribes next steps.",
    whenToUse: "Monthly or before a new AI rollout.",
    prompt:
      "Score our team on this AI Maturity Rubric (1–5) using what I provide. Return score per dimension and three concrete next steps to advance one level.\n\n[PASTE CONTEXT]",
    proTips: [
      "Pick one dimension to improve per month.",
      "Tie steps to measurable outcomes.",
      "Report deltas in a simple weekly line."
    ]
  }
];
