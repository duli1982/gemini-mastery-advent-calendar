import { ArrowRight, Bell, CheckCircle2, Clock3, X } from 'lucide-react';
import type { Progress, Track } from '../types';
import { calendarSummary } from '../lib/reminders';

interface Props {
  track:Track; progress:Progress; now:Date; hidden:boolean;
  onHide:(until:'today'|'visit')=>void; onRestore:()=>void;
  onOpen:(day:number)=>void; onCatchUp:()=>void; onContinue?:()=>void;
}

export default function CalendarReminders({track,progress,now,hidden,onHide,onRestore,onOpen,onCatchUp,onContinue}:Props) {
  const {available,unopened,today,next,practice}=calendarSummary(track.activities,progress,now);
  if(!available.length) return null;
  if(hidden) return <div className="reminder-restore"><button className="text-button" id="calendar-reminder-restore" onClick={onRestore}><Bell size={15}/>Show calendar reminders{unopened.length>0 && <span>{unopened.length} unopened</span>}</button></div>;
  const newDoor=today && !progress[today.id]?.opened ? today : undefined;
  const earlier=unopened.filter(a=>a.id!==newDoor?.id).length;
  const heading=newDoor ? `Day ${newDoor.day} is ready to explore.` : unopened.length
    ? `${unopened.length} available ${unopened.length===1?'activity you haven’t':'activities you haven’t'} opened.`
    : practice ? 'Ready to put this into practice?' : 'You’ve explored all available doors.';
  return <section className={`calendar-reminders ${!unopened.length && !practice?'caught-up':''}`} aria-label="Calendar reminders">
    <div className="reminder-symbol" aria-hidden="true">{!unopened.length && !practice ? <CheckCircle2 size={23}/> : <Bell size={23}/>}</div>
    <div className="reminder-body">
      <p className="eyebrow">{newDoor ? 'TODAY’S SMALL DISCOVERY' : practice && !unopened.length ? 'FROM READING TO DOING' : 'AT YOUR OWN PACE'}</p>
      <h2 id="calendar-reminder-heading" tabIndex={-1} aria-live="polite" aria-atomic="true">{heading}</h2>
      {newDoor ? <p>{newDoor.title} <span className="reminder-duration">· {newDoor.minutes} min</span>{earlier>0 && <span className="reminder-detail">{earlier} earlier {earlier===1?'activity is':'activities are'} waiting. Pick whichever helps your working day.</span>}</p>
        : unopened.length ? <p>There’s no need to rush. Choose something useful and pick up where you left off.</p>
        : practice ? <p>You opened “{practice.title}”. Give the exercise a go whenever it helps. Opening and trying an activity are tracked separately.</p>
        : <p>{next ? `The next door opens on ${next.toLocaleDateString('en-GB',{day:'numeric',month:'long'})} at midnight in your local time.` : 'All 24 doors remain available. Revisit a useful activity whenever you need it.'}</p>}
      <div className="reminder-actions">
        {newDoor && <button className="button primary" onClick={()=>onOpen(newDoor.day)}>Open today’s door<ArrowRight size={15}/></button>}
        {unopened.length>0 && <button className={`button ${newDoor?'secondary':'primary'}`} onClick={onCatchUp}>Explore unopened activities<ArrowRight size={15}/></button>}
        {!unopened.length && practice && <button className="button primary" onClick={()=>onOpen(practice.day)}>Revisit day {practice.day}<ArrowRight size={15}/></button>}
        {onContinue && (unopened.length>0 || practice) && <button className="text-button" onClick={onContinue}>Continue where I stopped<ArrowRight size={14}/></button>}
      </div>
      <div className="reminder-preferences"><button className="text-button" onClick={()=>onHide('visit')}><Clock3 size={13}/>Remind me next visit</button><span>Reminders appear while you use this site.</span></div>
    </div>
    <button className="icon-button reminder-dismiss" aria-label="Dismiss calendar reminders for today" title="Dismiss for today" onClick={()=>onHide('today')}><X size={18}/></button>
  </section>;
}
