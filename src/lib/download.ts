import type { Activity, Practice } from '../types';
import { practices } from '../content/practice';

export const exercisePrompt = (activity: Activity) => `${activity.prompt}\n\nFICTIONAL TRAINING INPUTS - NOT COMPANY POLICY OR REAL RECORDS\n\n${activity.practiceIds.map(id => `${practices[id].title}\n${practices[id].text}`).join('\n\n---\n\n')}`;
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadPractice(practice: Practice) {
  saveBlob(new Blob(['\uFEFF', practice.text], { type: practice.format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' }), `${practice.id}-fictional-training.${practice.format === 'csv' ? 'csv' : 'txt'}`);
}
