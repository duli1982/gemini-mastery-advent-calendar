import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Bookmark, BookOpen, BriefcaseBusiness, Check, CheckCircle2, CircleHelp, Clock3, Download, Gift, Grid2X2, Library, LockKeyhole, Search, Sparkles, Star, X } from 'lucide-react';
import { allActivities, tracks } from './content';
import { tasks } from './content/work';
import type { Activity, ActivityProgress, Filters, Progress, TrackId } from './types';
import { countdown, emptyProgress, filterActivities, isUnlocked, mergeProgress, parseRoute, readProgress, readResume, resumeKey, routeUrl, unlockTime, workbookUnlocked, writeProgress, type Route } from './lib/core';
import Lesson from './components/Lesson';
import Discovery, { ExtraFilters, TaskShortcuts, newFilters } from './components/Discovery';
import CalendarReminders from './components/CalendarReminders';
import WelcomeGuide from './components/WelcomeGuide';
import { COLLECTION_DESCRIPTION, SITE_NAME, TAGLINE } from './identity';
import { hasSeenWelcome, rememberWelcome } from './lib/welcome';
import { calendarSummary, emptyReminderPreferences, localDayKey, readReminderPreferences, writeReminderPreferences, type ReminderPreferences } from './lib/reminders';

const blankFilters = newFilters;
const REVIEW = __REVIEW__;
const TEAM_REVIEW = __TEAM_REVIEW__;

function GiftScene() {
  return <div className="gift-scene" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><Star className="scene-star star-one" size={25} /><Star className="scene-star star-two" size={14} /><Sparkles className="scene-sparkle" size={24} /><div className="scene-number">24</div><div className="present present-back"><span className="present-lid" /><span className="present-ribbon" /><span className="bow bow-left" /><span className="bow bow-right" /></div><div className="present present-main"><span className="present-lid" /><span className="present-ribbon" /><span className="bow bow-left" /><span className="bow bow-right" /><span className="present-tag">a brighter<br />way to work.</span></div><div className="scene-note"><span className="note-dot" /> A little discovery. Every day.</div></div>;
}

function ActivityCard({ activity: a, progress, unlocked, list, onOpen, onSave }: { activity: Activity; progress: ActivityProgress; unlocked: boolean; list: boolean; onOpen: () => void; onSave: () => void }) {
  return <article className={`activity-card ${unlocked ? 'unlocked' : 'locked'} ${progress.tried ? 'tried' : ''} ${list ? 'list-card' : ''}`}>
    <button className="card-open" onClick={onOpen} aria-label={`${unlocked ? 'Open' : 'Preview locked'} day ${a.day}: ${a.title}`}>
      <div className="card-top"><span className="day-label">DAY {String(a.day).padStart(2, '0')}</span><span className={`day-status ${progress.tried ? 'done' : ''}`}>{progress.tried ? <><CheckCircle2 size={14} /> Tried</> : !unlocked ? <><LockKeyhole size={13} /> Dec {a.day}</> : progress.opened ? 'Opened' : <><span className="status-dot" />Ready to explore</>}</span></div>
      <div className="card-gift" aria-hidden="true"><Gift size={26} strokeWidth={1.4} /></div><div className="card-content"><span className="card-tools">{a.tools.filter(tool => tool !== 'Gemini').slice(0, 2).join(' + ') || 'Gemini'}</span><h3>{a.title}</h3><p>{a.summary}</p><div className="card-bottom"><span><Clock3 size={13} />{a.minutes} min</span><span className="card-department">{a.departments[0]}</span><ArrowRight size={17} className="card-arrow" /></div></div>
    </button>{unlocked && <button className={`card-save ${progress.saved ? 'active' : ''}`} aria-label={`${progress.saved ? 'Unsave' : 'Save'} day ${a.day}`} aria-pressed={progress.saved} onClick={onSave}><Bookmark size={17} fill={progress.saved ? 'currentColor' : 'none'} /></button>}
  </article>;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.search));
  const [guideOpen,setGuideOpen] = useState(()=>{try{return !hasSeenWelcome(window.localStorage);}catch{return true;}});
  const [now, setNow] = useState(() => new Date());
  const [progress, setProgress] = useState<Progress>({});
  const [storageWarning, setStorageWarning] = useState(false);
  const [toast, setToast] = useState('');
  const [doorToast,setDoorToast] = useState<{track:TrackId;day:number}|null>(null);
  const seenDoorCounts=useRef<Partial<Record<TrackId,number>>>({});
  const [view, setView] = useState<'calendar' | 'library'>('calendar');
  const [filterState, setFilterState] = useState<Record<TrackId, Filters>>({ business: blankFilters(), guided: blankFilters() });
  const [exporting, setExporting] = useState(false);
  const [resume, setResume] = useState<Route | null>(null);
  const [progressReady,setProgressReady] = useState(false);
  const [reminderPreferences,setReminderPreferences] = useState<ReminderPreferences>(emptyReminderPreferences);
  const [remindersSnoozed,setRemindersSnoozed] = useState<Record<TrackId,boolean>>({business:false,guided:false});
  const track = tracks.find(t => t.id === route.track);
  const toolkitTask = route.view === 'toolkit' && route.task ? tasks.find(t=>t.id===route.task) : undefined;
  const activity = toolkitTask ? allActivities.find(a=>a.track==='business' && a.day===toolkitTask.day) : track?.activities.find(a => a.day === route.day);
  const workOnly = !!toolkitTask;
  const filters = filterState[route.track || 'guided'];
  const notify = useCallback((text: string) => { setDoorToast(null); setToast(text); }, []);

  useEffect(() => {
    try { const saved = readProgress(window.localStorage); setProgress(saved.progress); setStorageWarning(saved.warning); setResume(readResume(window.localStorage)); }
    catch { setStorageWarning(true); }
    try { const saved=readReminderPreferences(window.localStorage); setReminderPreferences(saved.preferences); if(saved.warning) setStorageWarning(true); } catch { setStorageWarning(true); }
    setProgressReady(true);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    const refreshTime = () => setNow(new Date());
    const syncStorage = () => {
      try { const saved=readProgress(window.localStorage); setProgress(saved.progress); const reminders=readReminderPreferences(window.localStorage); setReminderPreferences(reminders.preferences); if(saved.warning || reminders.warning) setStorageWarning(true); } catch { setStorageWarning(true); }
    };
    const pop = () => setRoute(parseRoute(window.location.search));
    window.addEventListener('popstate', pop);
    window.addEventListener('focus',refreshTime);
    document.addEventListener('visibilitychange',refreshTime);
    window.addEventListener('storage',syncStorage);
    return () => { clearInterval(timer); window.removeEventListener('popstate', pop); window.removeEventListener('focus',refreshTime); document.removeEventListener('visibilitychange',refreshTime); window.removeEventListener('storage',syncStorage); };
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 6000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { document.title = activity ? `${activity.title} | Day ${activity.day} | Smarter Work` : track ? `${track.name} | Smarter Work 2026` : `${SITE_NAME} | ${TAGLINE}`; }, [track, activity]);

  const updateProgress = useCallback((a: Activity, update: Partial<ActivityProgress>, workAccess = false) => {
    const unlocked = isUnlocked(a.day, new Date(), REVIEW);
    if (!unlocked && !workAccess) return;
    const safeUpdate = unlocked ? update : Object.fromEntries(Object.entries(update).filter(([key])=>key==='used' || key==='saved'));
    setProgress(previous => {
      const next = { ...previous, [a.id]: { ...(previous[a.id] || emptyProgress()), ...safeUpdate } };
      try { if (!writeProgress(window.localStorage, a.track, next)) setStorageWarning(true); } catch { setStorageWarning(true); }
      return next;
    });
  }, []);
  useEffect(() => { if (!guideOpen && activity && !workOnly && isUnlocked(activity.day, now, REVIEW) && !progress[activity.id]?.opened) updateProgress(activity, { opened: true }); }, [activity, workOnly, now, progress, updateProgress, guideOpen]);
  useEffect(()=>{
    if (!activity || guideOpen) return;
    const next:Route = workOnly ? { track:null,day:null,view:'toolkit',task:toolkitTask!.id } : { track:activity.track,day:activity.day };
    setResume(next);
    try { window.localStorage.setItem(resumeKey, new URLSearchParams(routeUrl(next).split('?')[1]).toString()); } catch { setStorageWarning(true); }
  },[activity?.id, workOnly, toolkitTask?.id, guideOpen]);

  const closeGuide = () => {
    setGuideOpen(false);
    try { if(!rememberWelcome(window.localStorage)) notify('Guide closed for this visit. Your browser could not remember this preference.'); }
    catch { notify('Guide closed for this visit. Your browser could not remember this preference.'); }
  };

  const navigate = (next: Route, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', routeUrl(next));
    setRoute(next);
    if (route.track !== next.track && !next.day) window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const patchFilters = (patch: Partial<Filters>) => { if (route.track) setFilterState(prev => ({ ...prev, [route.track!]: { ...prev[route.track!], ...patch } })); };
  const hideReminder = (until:'today'|'visit') => {
    if(!track) return;
    if(until==='visit') setRemindersSnoozed(previous=>({...previous,[track.id]:true}));
    else {
      const next={...reminderPreferences,[track.id]:localDayKey(now)};
      setReminderPreferences(next);
      try { if(!writeReminderPreferences(window.localStorage,next)) notify('Hidden for today in this visit. Your reminder preference could not be saved for another visit.'); }
      catch { notify('Hidden for today in this visit. Your reminder preference could not be saved for another visit.'); }
    }
    requestAnimationFrame(()=>document.getElementById('calendar-reminder-restore')?.focus());
  };
  const restoreReminder = () => {
    if(!track) return;
    setRemindersSnoozed(previous=>({...previous,[track.id]:false}));
    const next={...reminderPreferences,[track.id]:''}; setReminderPreferences(next);
    try { if(!writeReminderPreferences(window.localStorage,next)) notify('Reminders restored for this visit. Your preference could not be saved.'); } catch { notify('Reminders restored for this visit. Your preference could not be saved.'); }
    requestAnimationFrame(()=>document.getElementById('calendar-reminder-heading')?.focus());
  };
  const exploreUnopened = () => {
    patchFilters({...blankFilters(),unopenedOnly:true});
    requestAnimationFrame(()=>document.getElementById('calendar-results')?.focus());
  };
  const importProgress = (incoming:Progress) => setProgress(previous=>{
    const next=mergeProgress(previous,incoming);
    try { const businessSaved=writeProgress(window.localStorage,'business',next); const guidedSaved=writeProgress(window.localStorage,'guided',next); if(!businessSaved || !guidedSaved) setStorageWarning(true); } catch { setStorageWarning(true); }
    return next;
  });
  const visible = useMemo(() => track ? filterActivities(track.activities, filters, progress, now, REVIEW) : [], [track, filters, progress, now]);
  const departmentOptions = useMemo(() => [...new Set(track?.activities.flatMap(a => a.departments) || [])].sort(), [track]);
  const toolOptions = useMemo(() => [...new Set(track?.activities.flatMap(a => a.tools) || [])].sort(), [track]);
  const tried = track?.activities.filter(a => progress[a.id]?.tried).length || 0;
  const saved = track?.activities.filter(a => progress[a.id]?.saved).length || 0;
  const unopened = track ? calendarSummary(track.activities,progress,now,REVIEW).unopened.length : 0;
  const availableCount = track ? calendarSummary(track.activities,progress,now,REVIEW).available.length : 0;
  const remaining = countdown(now);
  const hasFilters = !!(filters.search || filters.department || filters.tool || filters.savedOnly || filters.unopenedOnly || filters.task || filters.maxMinutes || filters.level);

  useEffect(()=>{
    if(REVIEW || !progressReady || !track) return;
    const previous=seenDoorCounts.current[track.id];
    seenDoorCounts.current[track.id]=availableCount;
    if(previous===undefined || availableCount<=previous || remindersSnoozed[track.id] || reminderPreferences[track.id]===localDayKey(now)) return;
    const today=calendarSummary(track.activities,progress,now).today;
    if(today && !progress[today.id]?.opened) { setToast(`Day ${today.day} is ready to explore in ${track.name}.`); setDoorToast({track:track.id,day:today.day}); }
  },[availableCount,track,progressReady,progress,now,remindersSnoozed,reminderPreferences]);

  async function exportWorkbook() {
    if (!track || !workbookUnlocked(new Date(), REVIEW)) return;
    setExporting(true);
    try { const { downloadWorkbook } = await import('./lib/workbook'); await downloadWorkbook(track); notify(`${track.name} workbook download started.`); }
    catch (error) { console.error('Workbook export failed', error); notify('The workbook could not be generated. Try again; your progress is still here.'); }
    finally { setExporting(false); }
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    {REVIEW && <div className="review-banner"><Sparkles size={13} /><span><strong>{TEAM_REVIEW ? 'TEAM REVIEW' : 'REVIEW PREVIEW'}</strong> All 24 doors in both tracks and both workbooks are open. {TEAM_REVIEW ? 'For the pilot team. The public site follows December 2026 dates.' : 'The published build follows December 2026 dates.'}</span></div>}
    <header className="site-header"><div className="container header-inner"><button className="brand" aria-label="Smarter Work home" onClick={() => navigate({ track: null, day: null })}><span className="brand-mark"><Sparkles size={20} /></span><span>smarter work<span className="brand-sub">{TAGLINE}</span></span></button><nav aria-label="Main navigation">{track && <select className="header-track-select" aria-label="Switch track" value={track.id} onChange={event => navigate({ track: event.target.value as TrackId, day: null })}>{tracks.map(t => <option value={t.id} key={t.id}>{t.name}</option>)}</select>}{track ? <button className="text-button back-tracks" onClick={() => navigate({ track: null, day: null })}>Explore both tracks</button> : <a className="text-button" href="#journeys">Find your journey <ArrowDown size={14} /></a>}<button className="how-to-button" id="how-to-use" aria-haspopup="dialog" onClick={()=>setGuideOpen(true)}><CircleHelp size={16}/>How to use</button><span className="season-pill"><Star size={12} /> DECEMBER 1–24</span></nav></div></header>
    <div className="container utility-nav"><button className="text-button" onClick={()=>navigate({track:null,day:null,view:'discover'})}><Search size={15}/>Find a task</button><button className="text-button" onClick={()=>navigate({track:null,day:null,view:'toolkit'})}><BriefcaseBusiness size={15}/>Everyday Toolkit</button><button className="text-button" onClick={()=>navigate({track:null,day:null,view:'saved'})}><Bookmark size={15}/>My saved toolkit</button>{resume && <button className="text-button continue-button" onClick={()=>navigate(resume)}>Continue where I stopped<ArrowRight size={15}/></button>}</div>
    <main id="main">
      {route.view ? <Discovery mode={route.view} now={now} review={REVIEW} progress={progress} navigate={navigate} onImport={importProgress} notify={notify}/> : !track ? <>
        <section className="hero container"><div className="hero-copy"><p className="eyebrow"><span className="gold-line" /> {TAGLINE}</p><h1>24 days.<br />A smarter way<br />to <em>work.</em><Sparkles className="heading-spark" size={31} /></h1><p className="hero-description">{COLLECTION_DESCRIPTION} Explore an idea, practise with an example, or adapt it to a task you need to finish.</p><a className="button primary hero-cta" href="#journeys">Find your journey <ArrowDown size={17} /></a><div className="hero-footnote"><span className="mini-stars">✦ ✦ ✦</span> Two tracks. 48 discoveries. Your pace.</div></div><GiftScene /></section>
        <div className="container feature-strip-wrap"><div className="feature-strip"><span><Gift size={17} /> A new discovery every day</span><span><Clock3 size={17} /> Small, practical activities</span><span><BriefcaseBusiness size={17} /> Made for your working day</span><span><Bookmark size={17} /> Ideas worth keeping</span></div></div>
        <section className="container everyday-launch"><p className="eyebrow">A USEFUL START, ANY DAY</p><h2>What would help you today?</h2><p>Open one of eight reusable work templates now, or follow the December calendars below.</p><TaskShortcuts onChoose={task=>navigate({track:null,day:null,view:'toolkit',task})}/></section>
        <section id="journeys" className="container journeys"><div className="section-heading"><div><p className="eyebrow">ONE CALENDAR. TWO WAYS TO GROW.</p><h2>Choose your journey.</h2></div><p>Start with what you need today.<br />You can switch tracks whenever you like.</p></div><div className="track-cards">{tracks.map(t => <article key={t.id} className={`track-card ${t.color}`}><div className="track-card-top"><span className="track-icon">{t.id === 'guided' ? <BookOpen size={24} /> : <BriefcaseBusiness size={24} />}</span><span className="track-badge">{t.id === 'guided' ? 'GREAT PLACE TO START' : 'EXPLORE BY YOUR ROLE'}</span></div><p className="eyebrow">{t.eyebrow}</p><h3>{t.name}</h3><p>{t.description}</p><div className="track-details"><span>24 activities</span><span>10–25 min each</span><span>{t.id === 'guided' ? 'Four learning chapters' : 'Across business teams'}</span></div><button className="track-enter" onClick={() => navigate({ track: t.id, day: null })}>Explore {t.id === 'guided' ? 'the learning journey' : 'business activities'}<ArrowRight size={19} /></button></article>)}</div><p className="journey-note"><CheckCircle2 size={15} /> No sign-in. Fictional practice examples included. Your progress stays in this browser.</p></section>
        <section className="how-section container"><div><span className="eyebrow">A SMALL HABIT, EVERY DAY</span><h2>Open. Try. Keep.</h2><p>You don’t need to be an AI expert.<br />Just bring a little curiosity.</p></div>{[['01', 'Open a possibility', 'Discover a useful task and the Google tools that can help.'], ['02', 'Give it a go', 'Follow a few clear steps with ready-to-use training examples.'], ['03', 'Keep what works', 'Check your result and save a method for your next working day.']].map(([n, title, body]) => <div className="how-step" key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></div>)}</section>
      </> : <>
        <section className="track-hero container"><div className="track-switch" role="group" aria-label="Choose a track">{tracks.map(t => <button key={t.id} aria-pressed={t.id === track.id} className={t.id === track.id ? 'selected' : ''} onClick={() => navigate({ track: t.id, day: null })}>{t.id === 'guided' ? <BookOpen size={16} /> : <BriefcaseBusiness size={16} />}{t.name}</button>)}</div><div className="track-hero-row"><div><p className="eyebrow">YOUR DECEMBER, A LITTLE BRIGHTER</p><h1>{track.name}<span className="gold-period">.</span></h1><p className="track-description">{track.description}</p><div className="track-tags"><span>24 small discoveries</span><span>{track.id === 'guided' ? 'Learn → apply → reuse → automate' : 'Useful work across every department'}</span></div></div><div className="progress-box"><div className="progress-top"><span className="eyebrow">YOUR JOURNEY</span><Sparkles size={19} /></div><p><strong>{tried}</strong><span>/ 24 tried</span></p><div className="progress-bar" role="progressbar" aria-label={`${track.name} activities tried`} aria-valuenow={tried} aria-valuemin={0} aria-valuemax={24}><span style={{ width: `${tried / 24 * 100}%` }} /></div><span className="small">{tried === 24 ? 'A whole calendar of possibilities. Well done.' : tried ? 'Small steps add up. Keep going.' : 'Your first small win is waiting.'}</span></div></div></section>
        <section className="calendar-area"><div className="container">
          {!REVIEW && progressReady && <CalendarReminders track={track} progress={progress} now={now} hidden={remindersSnoozed[track.id] || reminderPreferences[track.id]===localDayKey(now)} onHide={hideReminder} onRestore={restoreReminder} onOpen={day=>navigate({track:track.id,day})} onCatchUp={exploreUnopened} onContinue={resume?.track===track.id && resume.day ? ()=>navigate(resume) : undefined}/>}
          <div className="calendar-toolbar"><div className="view-switch" role="group" aria-label="Activity view"><button aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}><Grid2X2 size={16} />Calendar</button><button aria-pressed={view === 'library'} onClick={() => setView('library')}><Library size={16} />Library</button></div><div className="calendar-timing">{REVIEW ? <><span className="status-dot" /> All gifts are open for review</> : remaining ? <><LockKeyhole size={14} />Day {remaining.day} opens in {remaining.days ? `${remaining.days}d ` : ''}{String(remaining.hours).padStart(2, '0')}:{String(remaining.minutes).padStart(2, '0')}:{String(remaining.seconds).padStart(2, '0')}<span className="local-label"> · your local time</span></> : <><CheckCircle2 size={15} />All 24 gifts are yours to explore</>}</div></div>
          <div className="calendar-primary-filters"><label>Search activities<span className="calendar-search-control"><Search size={18}/><input aria-label="Search activities" value={filters.search} onChange={e=>patchFilters({search:e.target.value})} placeholder="Find your next small win…" type="search"/></span></label><label>Department<select aria-label="Department" value={filters.department} onChange={e=>patchFilters({department:e.target.value})}><option value="">All departments</option>{departmentOptions.map(option=><option key={option}>{option}</option>)}</select></label><label>Tool<select aria-label="Tool" value={filters.tool} onChange={e=>patchFilters({tool:e.target.value})}><option value="">All tools</option>{toolOptions.map(option=><option key={option}>{option}</option>)}</select></label></div>
          <ExtraFilters filters={filters} onChange={patchFilters}/>
          <div className="calendar-progress-filters" role="group" aria-label="Activity progress"><span>Show</span><button aria-pressed={!filters.unopenedOnly && !filters.savedOnly} onClick={()=>patchFilters({unopenedOnly:false,savedOnly:false})}>All activities</button><button aria-pressed={!!filters.unopenedOnly} onClick={()=>patchFilters({unopenedOnly:!filters.unopenedOnly,savedOnly:false})}><Gift size={15}/>Unopened <span>{unopened}</span></button><button aria-pressed={filters.savedOnly} onClick={()=>patchFilters({savedOnly:!filters.savedOnly,unopenedOnly:false})}><Bookmark size={15}/>Saved <span>{saved}</span></button></div>
          <div className="results-heading" id="calendar-results" tabIndex={-1}><span role="status">{hasFilters ? `${visible.length} ${visible.length === 1 ? 'activity' : 'activities'} found` : track.id === 'guided' ? 'Four chapters. One confident you.' : 'A little inspiration for every working day.'}</span>{hasFilters ? <button className="text-button" onClick={() => patchFilters(blankFilters())}>Clear filters <X size={13} /></button> : <span className="small">DECEMBER 2026</span>}</div>
          {visible.length ? <div className={`activity-grid ${view === 'library' ? 'library-view' : ''}`}>{visible.map(a => <ActivityCard key={a.id} activity={a} progress={progress[a.id] || emptyProgress()} unlocked={isUnlocked(a.day, now, REVIEW)} list={view === 'library'} onOpen={() => navigate({ track: track.id, day: a.day })} onSave={() => updateProgress(a, { saved: !progress[a.id]?.saved })} />)}</div> : <div className="empty-state"><Search size={28} /><h2>No discoveries here yet.</h2><p>{filters.unopenedOnly ? 'No unopened activities match these filters. Newly available doors will appear here when they open.' : filters.savedOnly ? 'Save an activity using its bookmark, or explore the full calendar.' : 'Try another word, department or tool.'}</p><button className="button secondary" onClick={() => patchFilters(blankFilters())}>Show all 24 activities</button></div>}
          <div className="workbook-banner"><span className="workbook-icon"><BookOpen size={30} strokeWidth={1.3} /></span><div><p className="eyebrow">ALL THE GOOD IDEAS, IN ONE PLACE</p><h2>Your {track.id === 'guided' ? 'learning' : 'business'} workbook.</h2><p>All 24 activities, practice examples, prompts, and room for your own discoveries.</p></div><button className="button primary" disabled={exporting || !workbookUnlocked(now, REVIEW)} onClick={exportWorkbook}>{exporting ? 'Preparing workbook…' : workbookUnlocked(now, REVIEW) ? <><Download size={17} /> Download workbook</> : <><LockKeyhole size={16} /> Available December 24</>}</button></div>
          <div className="track-endnote"><Check size={15} /><span>{track.id === 'guided' ? 'Follow the days in order, or explore what you need. Earlier lessons are recommendations, never prerequisites.' : 'Pick the activities that help your role. Every gift includes an example and a check before you use it.'}</span></div>
        </div></section>
      </>}
      {storageWarning && <div className="container storage-warning" role="status">Some progress could not be read or saved. You can keep learning in this session; browser storage may be disabled or full.</div>}
    </main>
    <footer className="site-footer container"><div><span className="footer-brand">{TAGLINE}</span><p>{SITE_NAME} · 2026</p></div><div><span>Shared ideas. Everyday possibilities.</span><p>Use your approved Google tools. Practice examples are fictional.</p></div></footer>
    {activity && !guideOpen && <Lesson activity={activity} progress={progress[activity.id] || emptyProgress()} unlocked={isUnlocked(activity.day, now, REVIEW)} workOnly={workOnly} onClose={() => navigate(workOnly ? {track:null,day:null,view:'toolkit'} : { track: activity.track, day: null }, true)} onMove={day => navigate({ track: activity.track, day }, true)} onRelated={()=>navigate({track:activity.related.track,day:activity.related.day})} onToggle={field => updateProgress(activity, { [field]: !progress[activity.id]?.[field] }, workOnly)} notify={notify} />}
    {guideOpen && <WelcomeGuide review={REVIEW} onClose={closeGuide}/>}
    <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast && <><CheckCircle2 size={18} /><span>{toast}</span>{doorToast && <button className="text-button" onClick={()=>{navigate(doorToast);setToast('');}}>Open day {doorToast.day}<ArrowRight size={14}/></button>}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></>}</div>
  </>;
}
