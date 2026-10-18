export type TrackId = 'business' | 'guided';
export type Tool = 'Gemini' | 'Docs' | 'Gmail' | 'Sheets' | 'Slides' | 'Meet' | 'Notebook' | 'Vids' | 'Workspace Studio' | 'Gems / Skills';
export interface Reference { title: string; url: string }
export interface Practice { id: string; title: string; text: string; format: 'text' | 'csv'; workedExample?: string }
export type Experience = 'Starter' | 'Building confidence' | 'Advanced';
export type TaskId = 'email' | 'meeting' | 'actions' | 'spreadsheet' | 'performance' | 'documents' | 'presentation' | 'automation';
export interface WorkGuide {
  when: string; inputs: string[]; app: string; appUrl: string; steps: string[];
  prompt: string; output: string; template: string; checks: string[];
  tasks: TaskId[]; quickMinutes: number; level: Experience; variantIds: string[];
}
export interface DepartmentVariant {
  id: string; department: string; title: string; inputs: string[];
  prompt: string; example: string; template: string; checks: string[];
  guide: WorkGuide;
}
export interface Activity {
  id: string; track: TrackId; day: number; title: string; summary: string;
  departments: string[]; tools: Tool[]; minutes: number; phase: string;
  prerequisites: string; steps: string[]; prompt: string; practiceIds: string[];
  expected: string[]; checks: string[]; takeaway: string; advanced: string;
  fallback: string; references: Reference[]; verified: string; difference: string;
  work: WorkGuide; related: { track: TrackId; day: number };
}
export interface Track { id: TrackId; name: string; eyebrow: string; description: string; color: string; activities: Activity[] }
export interface ActivityProgress { opened: boolean; tried: boolean; saved: boolean; used: boolean }
export type Progress = Record<string, ActivityProgress>;
export interface Filters { search: string; department: string; tool: string; savedOnly: boolean; task?: TaskId | ''; maxMinutes?: number; level?: Experience | '' }
