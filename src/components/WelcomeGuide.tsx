import { useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, X } from 'lucide-react';
import { COLLECTION_DESCRIPTION, SITE_NAME, TAGLINE } from '../identity';

export default function WelcomeGuide({review,onClose}:{review:boolean;onClose:()=>void}) {
  const dialogRef=useRef<HTMLDialogElement>(null);
  const titleRef=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{
    const dialog=dialogRef.current!;
    const previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    dialog.showModal();document.body.style.overflow='hidden';titleRef.current?.focus();
    return ()=>{dialog.close();document.body.style.overflow=overflow;if(previous?.isConnected) previous.focus();};
  },[]);
  return <dialog ref={dialogRef} className="welcome-dialog" aria-labelledby="welcome-title" onCancel={event=>{event.preventDefault();onClose();}} onKeyDown={event=>{
    if(event.key!=='Tab') return;
    const buttons=Array.from(dialogRef.current!.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    const first=buttons[0],last=buttons[buttons.length-1];
    if(event.shiftKey && (document.activeElement===first || document.activeElement===titleRef.current)) {event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
  }}>
    <div className="welcome-shell">
      <header className="welcome-top"><span>{SITE_NAME} · 2026</span><button className="icon-button" aria-label="Close how-to guide" onClick={onClose}><X size={21}/></button></header>
      <div className="welcome-scroll">
        <p className="eyebrow">A SHARED COLLECTION. YOUR NEXT SMALL WIN.</p>
        <h2 id="welcome-title" ref={titleRef} tabIndex={-1}>{TAGLINE}</h2>
        <p className="welcome-intro">{COLLECTION_DESCRIPTION} Explore an idea, practise with an example, or adapt it to a task you need to finish.</p>
        <div className="welcome-tracks"><div><BriefcaseBusiness size={21}/><h3>Business Activities</h3><p>Find a task you need to finish today. Choose a work prompt and produce a checked result.</p></div><div><BookOpen size={21}/><h3>Guided Learning</h3><p>Learn an AI technique, practise it, then apply it to your work. Follow the days or explore freely.</p></div></div>
        <ol className="welcome-steps"><li><span>01</span><div><h3>Open</h3><p>Choose an activity that helps you.</p></div></li><li><span>02</span><div><h3>Try</h3><p>Follow the steps in your approved Google tools. Check the result.</p></div></li><li><span>03</span><div><h3>Keep</h3><p>Mark what you tried and save useful activities for next time.</p></div></li></ol>
        <p className="welcome-choices">Inside an activity, choose <strong>Use it for my work</strong> for a reusable prompt, or <strong>Practise with an example</strong> for fictional training material.</p>
        <div className="welcome-calendar"><CalendarDays size={19}/><p>{review ? 'Team review: all 24 doors in both tracks and both workbooks are open.' : 'A new door opens each day from 1–24 December 2026, at midnight in your local time. Earlier doors stay available.'}</p></div>
        <p className="welcome-privacy">Your progress stays in this browser. You don’t upload company documents to this site.</p>
      </div>
      <footer className="welcome-footer"><span>Find this guide anytime under <strong>How to use</strong>.</span><button className="button primary" onClick={onClose}>Start exploring<ArrowRight size={16}/></button></footer>
    </div>
  </dialog>;
}
