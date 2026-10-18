import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, BriefcaseBusiness, Check, CheckCircle2, Clock3, Copy, Download, ExternalLink, LockKeyhole, X } from 'lucide-react';
import type { Activity, ActivityProgress } from '../types';
import { practices } from '../content';
import { downloadPractice, exercisePrompt } from '../lib/download';
import { unlockTime } from '../lib/core';
import WorkPanel from './WorkPanel';

interface Props { activity: Activity; progress: ActivityProgress; unlocked: boolean; workOnly?: boolean; onClose: () => void; onMove: (day: number) => void; onRelated: () => void; onToggle: (field: 'tried' | 'saved' | 'used') => void; notify: (text: string) => void }
export default function Lesson({ activity: a, progress, unlocked, workOnly = false, onClose, onMove, onRelated, onToggle, notify }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const copyFallback = useRef<HTMLTextAreaElement>(null);
  const [manualCopy, setManualCopy] = useState(false);
  const [manualText, setManualText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [tab, setTab] = useState<'work' | 'learn' | 'practice'>(a.track === 'business' || workOnly ? 'work' : 'learn');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = originalOverflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => { setTab(a.track === 'business' || workOnly ? 'work' : 'learn'); setManualCopy(false); setFeedback(''); scrollRef.current?.scrollTo(0, 0); ref.current?.querySelector<HTMLButtonElement>('[aria-label="Close activity"]')?.focus(); }, [a.id, a.track, workOnly]);
  useEffect(() => { if (manualCopy) { copyFallback.current?.focus(); copyFallback.current?.select(); } }, [manualCopy, manualText]);
  const announce = (text: string) => { setFeedback(text); notify(text); };
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); announce('Copied to clipboard. Ready for your approved Google tool.'); }
    catch { setManualText(text); setManualCopy(true); announce('Clipboard is unavailable. Select and copy the text in the field below.'); }
  }
  return <dialog ref={ref} className="lesson-dialog" aria-modal="true" aria-labelledby="lesson-title" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea, input, select, summary, [tabindex="0"]')).filter(el => el.getClientRects().length > 0);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="lesson-shell">
      <header className="lesson-top"><span className="eyebrow">{workOnly ? 'EVERYDAY TOOLKIT' : a.track === 'guided' ? 'GUIDED LEARNING' : 'BUSINESS ACTIVITIES'} {!workOnly && <span className="muted">/ DAY {String(a.day).padStart(2, '0')}</span>}</span><div className="lesson-top-actions"><button className="text-button" onClick={()=>copy(window.location.href)}>Copy activity link</button><button autoFocus className="icon-button" aria-label="Close activity" onClick={onClose}><X size={22} /></button></div></header>
      <div className="lesson-scroll" ref={scrollRef}>
        <div className="lesson-heading">{!workOnly && <span className="lesson-number" aria-hidden="true">{String(a.day).padStart(2, '0')}</span>}<p className="eyebrow">{workOnly ? 'A USEFUL TEMPLATE, ANY DAY' : a.phase}</p><h2 id="lesson-title">{a.title}</h2><p>{a.summary}</p><div className="lesson-meta"><span><Clock3 size={15} /> {workOnly ? a.work.quickMinutes : a.minutes} min{workOnly && a.work.quickMinutes>=15 ? ' setup' : ''}</span>{a.tools.map(tool => <span className="tool-chip" key={tool}>{tool}</span>)}</div><p className="audience">For {a.departments.join(' · ')}</p></div>
        {!unlocked && !workOnly ? <div className="locked-lesson"><LockKeyhole size={30} /><h3>A little anticipation.</h3><p>This activity opens on {unlockTime(a.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at midnight in your local time.</p><p>Explore the titles and tools while you wait, or use one of the separate Everyday Toolkit templates.</p></div> : <>
          {!workOnly && <>
          <div className="lesson-tabs" role="tablist" aria-label="Activity sections">
            {(['work','learn','practice'] as const).map((name,i,all)=><button key={name} role="tab" id={`${name}-tab`} aria-selected={tab === name} aria-controls={`${name}-panel`} tabIndex={tab === name ? 0 : -1} onKeyDown={e=>{ if (['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? all[0] : e.key === 'End' ? all[2] : all[(i+(e.key==='ArrowRight'?1:2))%3]; setTab(next); document.getElementById(`${next}-tab`)?.focus(); } }} onClick={()=>setTab(name)}>{name==='work' ? 'Use it for my work' : name==='learn' ? 'Practise with an example' : <>Practice materials <span>{a.practiceIds.length}</span></>}</button>)}
          </div>
          </>}
          {tab === 'work' || workOnly ? <div role={workOnly ? undefined : 'tabpanel'} id="work-panel" aria-labelledby={workOnly ? undefined : 'work-tab'}><WorkPanel activity={a} copy={copy} notify={announce}/></div> :
          tab === 'learn' ? <div role="tabpanel" id="learn-panel" aria-labelledby="learn-tab">
            <section className="lesson-section"><h3>Before you begin</h3><p>{a.prerequisites}</p></section>
            <section className="lesson-section"><h3>Try it, step by step</h3><ol className="steps">{a.steps.map((step, i) => <li key={i}><span>{i + 1}</span><p>{step}</p></li>)}</ol></section>
            <section className="prompt-section"><div className="section-top"><h3>Your starting prompt</h3><span className="eyebrow">MAKE IT YOURS</span></div><pre>{a.prompt}</pre><button className="button primary" onClick={() => copy(exercisePrompt(a))}><Copy size={16} />Copy prompt + practice inputs</button><p className="small">Includes the fictional examples from Practice materials. Use in your approved Google tool.</p></section>
            <section className="lesson-section"><h3>Your result</h3><p>Run the exercise in your approved Google tool, then compare your actual result with the worked example. Keep your own checks separate from the AI response.</p><details className="worked-example"><summary>Reveal the worked example</summary><ul className="check-list">{a.expected.map(text => <li key={text}><CheckCircle2 size={18} /><span>{text}</span></li>)}</ul>{a.practiceIds.filter(id=>practices[id].workedExample).map(id=><div key={id}><h4>{practices[id].title}</h4><pre>{practices[id].workedExample}</pre></div>)}<p>Check the result against the original source. For facts, locate the supporting sentence; for numbers, reproduce the calculation. Different wording is acceptable when the evidence and required outcome agree.</p></details></section>
            <section className="lesson-section"><h3>Check before you use it</h3><ul className="check-list">{a.checks.map(text => <li key={text}><Check size={18} /><span>{text}</span></li>)}</ul></section>
            <div className="takeaway"><span className="eyebrow">A LITTLE SOMETHING TO KEEP</span><h3>{a.takeaway}</h3><p><strong>Go further:</strong> {a.advanced}</p></div>
            <button className="button secondary" onClick={()=>{setTab('work'); scrollRef.current?.scrollTo(0,0);}}>Apply the technique to my work<ArrowRight size={16}/></button>
            <section className="lesson-section"><h3>If a feature isn’t available</h3><p>{a.fallback}</p></section>
          </div> : <div role="tabpanel" id="practice-panel" aria-labelledby="practice-tab">
            <p className="practice-notice">All people, records, procedures and results here are fictional training examples. They are not Randstad policy or real business data.</p>
            {a.practiceIds.map(id => { const p = practices[id]; return <section className="practice-block" key={id}><div className="section-top"><h3>{p.title}</h3><span className="format-chip">{p.format.toUpperCase()}</span></div><pre>{p.text}</pre><div className="practice-actions"><button className="button secondary" onClick={() => copy(p.text)}><Copy size={15} /> Copy example</button><button className="button secondary" onClick={() => { try { downloadPractice(p); announce('Practice file download started.'); } catch { announce('Download could not start. Use Copy example instead.'); } }}><Download size={15} />Download {p.format === 'csv' ? 'CSV' : 'text'}</button></div></section>; })}
          </div>}
          {!workOnly && <section className="related-activity"><h3>{a.track === 'business' ? 'Learn the technique' : 'Apply this at work'}</h3><p>{a.track === 'business' ? 'Explore a related skill in Guided Learning.' : 'Build a useful deliverable in Business Activities.'} Day {a.related.day}; calendar dates apply.</p><button className="button secondary" onClick={onRelated}>Open related activity<ArrowRight size={16}/></button></section>}
          <section className="lesson-section references"><h3>Official guidance</h3>{a.references.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={14} /></a>)}<p className="small">Documentation checked {a.verified}. Exercises have not been run in your company tenant. Feature names, access and limits may vary; check the linked guidance.</p></section>
          {manualCopy && <section className="manual-copy"><label htmlFor="manual-copy">Select this text and copy it manually</label><textarea id="manual-copy" ref={copyFallback} readOnly value={manualText} rows={8} /></section>}
        </>}
      </div>
      {feedback && <div className="lesson-feedback" role="status">{feedback}</div>}
      <footer className="lesson-footer">{!workOnly && <div className="lesson-navigation"><button className="icon-button" aria-label="Previous day" disabled={a.day === 1} onClick={() => onMove(a.day - 1)}><ArrowLeft size={18} /></button><span>{a.day} / 24</span><button className="icon-button" aria-label="Next day" disabled={a.day === 24} onClick={() => onMove(a.day + 1)}><ArrowRight size={18} /></button></div>}{(unlocked || workOnly) && <div className="lesson-actions"><button className={`button secondary ${progress.saved ? 'is-saved' : ''}`} aria-pressed={progress.saved} onClick={() => onToggle('saved')}><Bookmark size={16} fill={progress.saved ? 'currentColor' : 'none'} /><span>{progress.saved ? 'Saved' : 'Save'}</span></button><button className={`button secondary ${progress.used ? 'is-saved' : ''}`} aria-pressed={progress.used} onClick={()=>onToggle('used')}><BriefcaseBusiness size={16}/>{progress.used ? 'Used in my work' : 'Mark as used at work'}</button>{!workOnly && <button className={`button ${progress.tried ? 'completed' : 'primary'}`} aria-pressed={progress.tried} onClick={() => onToggle('tried')}><Check size={17} />{progress.tried ? 'Tried it' : 'Mark as tried'}</button>}</div>}</footer>
    </div>
  </dialog>;
}
