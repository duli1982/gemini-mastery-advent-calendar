import { useEffect, useState } from 'react';
import { Copy, Download, ExternalLink } from 'lucide-react';
import type { Activity } from '../types';
import { departmentVariants } from '../content/work';
import { downloadJobAid } from '../lib/download';

export default function WorkPanel({ activity:a, copy, notify }: { activity:Activity; copy:(text:string)=>void; notify:(text:string)=>void }) {
  const [variantId, setVariantId] = useState('');
  useEffect(() => setVariantId(''), [a.id]);
  const variant = departmentVariants[variantId];
  const w = variant?.guide || a.work;
  const prompt = variant?.prompt || w.prompt;
  const template = variant?.template || w.template;
  return <div className="work-panel">
    <div className="work-intro"><p className="eyebrow">{a.track === 'business' ? 'FINISH A USEFUL TASK' : 'APPLY THE TECHNIQUE'}</p><h3>{w.output}</h3><p>{w.quickMinutes} min {w.quickMinutes >= 15 ? 'setup or full application' : 'quick application'} · {w.level}</p></div>
    <div className="work-actions"><button className="button primary" onClick={()=>copy(prompt)}><Copy size={16}/>Copy work prompt</button><a className="button secondary" href={w.appUrl} target="_blank" rel="noreferrer">Open {w.app.split(' · ')[0]}<ExternalLink size={15}/></a><button className="button secondary" onClick={()=>{ try { downloadJobAid(a, variantId); notify('Work job aid download started.'); } catch { notify('Job aid download could not start. Use the copy buttons instead.'); } }}><Download size={16}/>Download job aid</button></div>
    <p className="work-privacy">Use your company account and permitted sources inside your approved Google tools. No company content is entered into this site. Replace bracketed fields in the copied prompt there.</p>
    <dl className="work-facts"><div><dt>Use this when</dt><dd>{variant ? variant.title : w.when}</dd></div><div><dt>Have ready</dt><dd><ul>{(variant?.inputs || w.inputs).map(s=><li key={s}>{s}</li>)}</ul></dd></div><div><dt>Open</dt><dd>{w.app}</dd></div></dl>
    {a.work.variantIds.length > 0 && <div className="department-choice"><label htmlFor="department-example">Adapt for a department</label><select id="department-example" value={variantId} onChange={e=>setVariantId(e.target.value)}><option value="">Standard work template</option>{a.work.variantIds.map(id=><option value={id} key={id}>{departmentVariants[id].department} — {departmentVariants[id].title}</option>)}</select></div>}
    <section className="lesson-section"><h3>Do</h3><ol className="steps">{w.steps.map((s,i)=><li key={s}><span>{i+1}</span><p>{s}</p></li>)}</ol></section>
    <section className="prompt-section"><h3>Your work prompt</h3><pre>{prompt}</pre></section>
    <section className="lesson-section"><h3>Output template</h3><p>Tab-separated tables can be pasted into Sheets. Text templates can be kept in Docs.</p><pre className="template-text">{template}</pre><button className="button secondary" onClick={()=>copy(template)}><Copy size={15}/>Copy output template</button></section>
    <section className="lesson-section"><h3>Check before you use it</h3><ul>{(variant?.checks || w.checks).map(s=><li key={s}>{s}</li>)}</ul></section>
    {variant && <details className="worked-example"><summary>Try this department example</summary><p className="practice-notice">Fictional training content, not company policy or real records.</p><pre>{variant.example}</pre><button className="button secondary" onClick={()=>copy(`${variant.prompt}\n\n${variant.example}`)}><Copy size={15}/>Copy department practice</button><p>Use the checks above to review your result before adapting the method to work.</p></details>}
    <section className="lesson-section"><h3>If a feature isn’t available</h3><p>{a.fallback}</p></section>
  </div>;
}
