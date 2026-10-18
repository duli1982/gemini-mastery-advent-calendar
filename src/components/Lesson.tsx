import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, Clock3, Copy, Download, ExternalLink, LockKeyhole, X } from 'lucide-react';
import type { Activity, ActivityProgress } from '../types';
import { practices } from '../content';
import { downloadPractice, exercisePrompt } from '../lib/download';
import { unlockTime } from '../lib/core';

interface Props { activity: Activity; progress: ActivityProgress; unlocked: boolean; onClose: () => void; onMove: (day: number) => void; onToggle: (field: 'tried' | 'saved') => void; notify: (text: string) => void }
export default function Lesson({ activity: a, progress, unlocked, onClose, onMove, onToggle, notify }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const copyFallback = useRef<HTMLTextAreaElement>(null);
  const [manualCopy, setManualCopy] = useState(false);
  const [manualText, setManualText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [tab, setTab] = useState<'learn' | 'practice'>('learn');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = originalOverflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => { setTab('learn'); setManualCopy(false); setFeedback(''); scrollRef.current?.scrollTo(0, 0); }, [a.id]);
  useEffect(() => { if (manualCopy) { copyFallback.current?.focus(); copyFallback.current?.select(); } }, [manualCopy, manualText]);
  const announce = (text: string) => { setFeedback(text); notify(text); };
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); announce('Copied to clipboard. Ready for your approved Google tool.'); }
    catch { setManualText(text); setManualCopy(true); announce('Clipboard is unavailable. Select and copy the text in the field below.'); }
  }
  return <dialog ref={ref} className="lesson-dialog" aria-modal="true" aria-labelledby="lesson-title" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea, input, select, [tabindex="0"]')).filter(el => el.getClientRects().length > 0);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="lesson-shell">
      <header className="lesson-top"><span className="eyebrow">{a.track === 'guided' ? 'GUIDED LEARNING' : 'BUSINESS ACTIVITIES'} <span className="muted">/ DAY {String(a.day).padStart(2, '0')}</span></span><button autoFocus className="icon-button" aria-label="Close activity" onClick={onClose}><X size={22} /></button></header>
      <div className="lesson-scroll" ref={scrollRef}>
        <div className="lesson-heading"><span className="lesson-number" aria-hidden="true">{String(a.day).padStart(2, '0')}</span><p className="eyebrow">{a.phase}</p><h2 id="lesson-title">{a.title}</h2><p>{a.summary}</p><div className="lesson-meta"><span><Clock3 size={15} /> {a.minutes} min</span>{a.tools.map(tool => <span className="tool-chip" key={tool}>{tool}</span>)}</div><p className="audience">For {a.departments.join(' · ')}</p></div>
        {!unlocked ? <div className="locked-lesson"><LockKeyhole size={30} /><h3>A little anticipation.</h3><p>This activity opens on {unlockTime(a.day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at midnight in your local time.</p><p>Explore the titles and tools while you wait. Your first gift is on its way.</p></div> : <>
          <div className="lesson-tabs" role="tablist" aria-label="Activity sections">
            <button role="tab" id="learn-tab" aria-selected={tab === 'learn'} aria-controls="learn-panel" tabIndex={tab === 'learn' ? 0 : -1} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setTab('practice'); document.getElementById('practice-tab')?.focus(); } }} onClick={() => setTab('learn')}>The activity</button>
            <button role="tab" id="practice-tab" aria-selected={tab === 'practice'} aria-controls="practice-panel" tabIndex={tab === 'practice' ? 0 : -1} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setTab('learn'); document.getElementById('learn-tab')?.focus(); } }} onClick={() => setTab('practice')}>Practice materials <span>{a.practiceIds.length}</span></button>
          </div>
          {tab === 'learn' ? <div role="tabpanel" id="learn-panel" aria-labelledby="learn-tab">
            <section className="lesson-section"><h3>Before you begin</h3><p>{a.prerequisites}</p></section>
            <section className="lesson-section"><h3>Try it, step by step</h3><ol className="steps">{a.steps.map((step, i) => <li key={i}><span>{i + 1}</span><p>{step}</p></li>)}</ol></section>
            <section className="prompt-section"><div className="section-top"><h3>Your starting prompt</h3><span className="eyebrow">MAKE IT YOURS</span></div><pre>{a.prompt}</pre><button className="button primary" onClick={() => copy(exercisePrompt(a))}><Copy size={16} />Copy prompt + practice inputs</button><p className="small">Includes the fictional examples from Practice materials. Use in your approved Google tool.</p></section>
            <section className="lesson-section"><h3>What good looks like</h3><ul className="check-list">{a.expected.map(text => <li key={text}><CheckCircle2 size={18} /><span>{text}</span></li>)}</ul></section>
            <section className="lesson-section"><h3>Check before you use it</h3><ul className="check-list">{a.checks.map(text => <li key={text}><Check size={18} /><span>{text}</span></li>)}</ul></section>
            <div className="takeaway"><span className="eyebrow">A LITTLE SOMETHING TO KEEP</span><h3>{a.takeaway}</h3><p><strong>Go further:</strong> {a.advanced}</p></div>
            <section className="lesson-section"><h3>If a feature isn’t available</h3><p>{a.fallback}</p></section>
            <section className="lesson-section references"><h3>Official guidance</h3>{a.references.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}<ExternalLink size={14} /></a>)}<p className="small">Documentation checked {a.verified}. Exercises have not been run in your company tenant. Feature names, access and limits may vary; check the linked guidance.</p></section>
          </div> : <div role="tabpanel" id="practice-panel" aria-labelledby="practice-tab">
            <p className="practice-notice">All people, records, procedures and results here are fictional training examples. They are not Randstad policy or real business data.</p>
            {a.practiceIds.map(id => { const p = practices[id]; return <section className="practice-block" key={id}><div className="section-top"><h3>{p.title}</h3><span className="format-chip">{p.format.toUpperCase()}</span></div><pre>{p.text}</pre><div className="practice-actions"><button className="button secondary" onClick={() => copy(p.text)}><Copy size={15} /> Copy example</button><button className="button secondary" onClick={() => { try { downloadPractice(p); announce('Practice file download started.'); } catch { announce('Download could not start. Use Copy example instead.'); } }}><Download size={15} />Download {p.format === 'csv' ? 'CSV' : 'text'}</button></div></section>; })}
          </div>}
          {manualCopy && <section className="manual-copy"><label htmlFor="manual-copy">Select this text and copy it manually</label><textarea id="manual-copy" ref={copyFallback} readOnly value={manualText} rows={8} /></section>}
        </>}
      </div>
      {feedback && <div className="lesson-feedback" role="status">{feedback}</div>}
      <footer className="lesson-footer"><div className="lesson-navigation"><button className="icon-button" aria-label="Previous day" disabled={a.day === 1} onClick={() => onMove(a.day - 1)}><ArrowLeft size={18} /></button><span>{a.day} / 24</span><button className="icon-button" aria-label="Next day" disabled={a.day === 24} onClick={() => onMove(a.day + 1)}><ArrowRight size={18} /></button></div>{unlocked && <div className="lesson-actions"><button className={`button secondary ${progress.saved ? 'is-saved' : ''}`} aria-pressed={progress.saved} onClick={() => onToggle('saved')}><Bookmark size={16} fill={progress.saved ? 'currentColor' : 'none'} /><span>{progress.saved ? 'Saved' : 'Save'}</span></button><button className={`button ${progress.tried ? 'completed' : 'primary'}`} aria-pressed={progress.tried} onClick={() => onToggle('tried')}><Check size={17} />{progress.tried ? 'Tried it' : 'Mark as tried'}</button></div>}</footer>
    </div>
  </dialog>;
}
