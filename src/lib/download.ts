import type { Activity, Practice } from '../types';
import { practices } from '../content/practice';
import { departmentVariants } from '../content/work';

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
export function jobAidText(a: Activity, variantId = '') {
  const v = a.work.variantIds.includes(variantId) ? departmentVariants[variantId] : undefined;
  const w = v?.guide || a.work;
  return [`${a.title} - work job aid`, '24 Days of Smarter Work | From the People, to the People. | 2026', v ? `Department: ${v.department} - ${v.title}` : '', `USE THIS WHEN\n${w.when}`, `HAVE READY\n${(v?.inputs || w.inputs).map(s => `- ${s}`).join('\n')}`, `OPEN\n${w.app}\n${w.appUrl}`, `DO\n${w.steps.map((s,i) => `${i+1}. ${s}`).join('\n')}`, `YOU WILL GET\n${w.output}`, `WORK PROMPT\n${v?.prompt || w.prompt}`, `OUTPUT TEMPLATE\n${v?.template || w.template}`, `CHECK\n${(v?.checks || w.checks).map(s=>`- ${s}`).join('\n')}`, `IF UNAVAILABLE\n${a.fallback}`, 'Use only company-approved tools and permitted sources. Replace bracketed fields inside your Google tool. This job aid contains no company records.', `OFFICIAL GUIDANCE\n${a.references.map(r=>`${r.title}\n${r.url}`).join('\n')}\nDocumentation checked ${a.verified}; exercises have not been tested in your company tenant.`].filter(Boolean).join('\n\n');
}
export function downloadJobAid(a: Activity, variantId = '') {
  saveBlob(new Blob(['\uFEFF', jobAidText(a, variantId)], { type:'text/plain;charset=utf-8' }), `${a.id}${variantId ? `-${variantId}` : ''}-work-job-aid.txt`);
}
