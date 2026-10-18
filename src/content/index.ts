import type { Track } from '../types';
import { businessActivities } from './business';
import { guidedActivities } from './guided';
export { practices } from './practice';
export const tracks: Track[] = [
  { id: 'guided', name: 'Guided Learning', eyebrow: 'Build your confidence', description: 'A step-by-step journey from your first useful prompt to a tested Workspace Studio flow.', color: 'green', activities: guidedActivities },
  { id: 'business', name: 'Business Activities', eyebrow: 'Make work lighter', description: 'Practical tasks for your department. Find a challenge, try a workflow, keep what works.', color: 'gold', activities: businessActivities },
];
export const allActivities = tracks.flatMap(track => track.activities);
