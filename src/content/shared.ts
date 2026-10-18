import type { Activity, Reference, Tool, TrackId } from '../types';
import { relatedFor, workFor } from './work';

export const references: Record<string, Reference> = {
  docs: { title: 'Google: writing with Gemini in Docs', url: 'https://support.google.com/docs/answer/13447609?hl=en' },
  gmail: { title: 'Google: collaborate with Gemini in Gmail', url: 'https://support.google.com/mail/answer/14355636?hl=en' },
  sheets: { title: 'Google: collaborate with Gemini in Sheets', url: 'https://support.google.com/docs/answer/14356410?hl=en&co=GENIE.Platform%3DDesktop' },
  meet: { title: 'Google: Take notes for me in Meet', url: 'https://support.google.com/meet/answer/14754931?hl=en' },
  notebook: { title: 'Google: Gemini Notebook help and source answers', url: 'https://support.google.com/gemininotebook/answer/16269187?hl=en' },
  research: { title: 'Google: Deep Research', url: 'https://support.google.com/gemini/answer/15719111?hl=en' },
  slides: { title: 'Google: creating across Workspace apps', url: 'https://workspace.google.com/blog/product-announcements/less-switching-more-flow-5-new-agentic-capabilities-across-google-workspace-apps' },
  vids: { title: 'Google: create a first video in Vids', url: 'https://support.google.com/a/users/answer/14819770?hl=en' },
  studio: { title: 'Google: create a Workspace Studio flow', url: 'https://support.google.com/a/users/answer/16430397' },
  conditions: { title: 'Google: conditional steps in Studio', url: 'https://support.google.com/workspace-studio/answer/16431010?hl=en' },
  steps: { title: 'Google: Studio starters, steps and variables', url: 'https://support.google.com/workspace-studio/table/17176961?hl=en' },
  skills: { title: 'Google: Gems to Skills transition and rollout updates', url: 'https://workspaceupdates.googleblog.com/2026/09/skills-gemini-app-workspace.html?hl=en_UG' },
};
export const fallbackFor = (tools: Tool[]): string => tools.includes('Workspace Studio')
  ? 'If Studio or an AI step is unavailable, paste each test message into Gemini, apply the same extraction and routing rules, and record the expected notification in a Doc. This teaches the workflow without enabling automation.'
  : tools.includes('Gems / Skills')
  ? 'If Gems or Skills is unavailable during the rollout, save the complete instructions in a Doc and paste them at the start of a fresh Gemini conversation. Test the same cases; do not assume instructions transfer between apps.'
  : tools.includes('Notebook')
  ? 'If Notebook is unavailable, supply the practice documents directly in an approved Gemini conversation and request source names and quoted evidence. Find and verify every quotation in the originals.'
  : tools.includes('Vids')
  ? 'If Vids or an AI video feature is unavailable, create the storyboard and narration in Docs, then build the same scenes in Slides. A checked script is a valid takeaway.'
  : tools.includes('Sheets')
  ? 'If Gemini in Sheets is unavailable, paste the fictional CSV and task into approved Gemini, then reproduce and check its calculations in Sheets using formulas. Keep the original data intact.'
  : tools.includes('Meet')
  ? 'If meeting notes are unavailable or inappropriate for the meeting, use the fictional notes here or your own permitted notes. Complete the review and action log in Docs.'
  : 'If the Gemini side panel is unavailable, use the approved Gemini app with this fictional practice text, or complete the same steps manually in a Doc. No connection to this learning site is required.';

type LessonInput = Omit<Activity, 'id' | 'track' | 'day' | 'phase' | 'verified' | 'references' | 'fallback' | 'work' | 'related'> & { refs?: string[]; fallback?: string };
export function lesson(track: TrackId, day: number, input: LessonInput): Activity {
  const { refs = ['docs'], ...fields } = input;
  return { ...fields, id: `${track}-${String(day).padStart(2, '0')}`, track, day,
    phase: track === 'business' ? 'Practical work, one useful task at a time' : ['Everyday essentials', 'Work with evidence', 'Across the business', 'Reuse & automate'][Math.floor((day - 1) / 6)],
    verified: '2026-10-18', references: refs.map(ref => references[ref]), fallback: input.fallback || fallbackFor(input.tools), work: workFor(track, day), related: relatedFor(track, day) };
}
