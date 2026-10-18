export type TrackId = 'business' | 'guided';
export type Tool = 'Gemini' | 'Docs' | 'Gmail' | 'Sheets' | 'Slides' | 'Meet' | 'Notebook' | 'Vids' | 'Workspace Studio' | 'Gems / Skills';
export interface Reference { title: string; url: string }
export interface Practice { id: string; title: string; text: string; format: 'text' | 'csv' }
export interface Activity {
  id: string; track: TrackId; day: number; title: string; summary: string;
  departments: string[]; tools: Tool[]; minutes: number; phase: string;
  prerequisites: string; steps: string[]; prompt: string; practiceIds: string[];
  expected: string[]; checks: string[]; takeaway: string; advanced: string;
  fallback: string; references: Reference[]; verified: string; difference: string;
}
export interface Track { id: TrackId; name: string; eyebrow: string; description: string; color: string; activities: Activity[] }
export interface ActivityProgress { opened: boolean; tried: boolean; saved: boolean }
export type Progress = Record<string, ActivityProgress>;
export interface Filters { search: string; department: string; tool: string; savedOnly: boolean }
