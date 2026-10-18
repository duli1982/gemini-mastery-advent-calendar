import type { Track } from '../types';
import { businessActivities } from './business';
import { guidedActivities } from './guided';
export { practices } from './practice';
export const tracks: Track[] = [
  { id: 'guided', name: 'Guided Learning', eyebrow: 'How do I become better at using AI?', description: 'Learn one technique, practise with evidence, then apply it to your work. Build confidence from everyday prompts to tested automation.', color: 'green', activities: guidedActivities },
  { id: 'business', name: 'Business Activities', eyebrow: 'What do I need to finish today?', description: 'Choose a departmental task, use a work template and produce a checked deliverable. Keep the method for your next working day.', color: 'gold', activities: businessActivities },
];
export const allActivities = tracks.flatMap(track => track.activities);
