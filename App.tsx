import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdventGrid } from './components/AdventGrid';
import { SurpriseModal } from './components/SurpriseModal';
import { CountdownTimer } from './components/CountdownTimer';
import { ParticleBurst } from './components/ParticleBurst';
import { CookieConsent } from './components/CookieConsent';
import { getDailySurprise } from './services/geminiService';
import { CALENDAR_DAYS } from './constants';
import type { CalendarDay } from './types';
import { Confetti } from './components/Confetti';
import { getCurrentLocalDate, getCurrentDecemberDay, isOpenAllEnabled } from './utils/dateUtils';
import { analytics } from './utils/analytics';

const Snowfall: React.FC = () => {
  const snowFlakes = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      const style = {
        '--x-start': `${Math.random() * 100}vw`,
        '--x-end': `${Math.random() * 100}vw`,
        animationDuration: `${5 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 10}s`,
        transform: `scale(${0.2 + Math.random() * 0.8})`,
      } as React.CSSProperties;
      return <div key={i} className="snow" style={style} />;
    });
  }, []);

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">{snowFlakes}</div>;
};

const App: React.FC = () => {
  // Use real local date instead of demo date
  const [currentDate, setCurrentDate] = useState(getCurrentLocalDate());
  const [openedDays, setOpenedDays] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('geminiAdventOpenedDays');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error("Failed to parse opened days from localStorage", error);
      return new Set();
    }
  });

  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [modalContent, setModalContent] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [ornamentShape, setOrnamentShape] = useState<'bulb' | 'circle'>('bulb');
  const [particleBurst, setParticleBurst] = useState<{ x: number; y: number } | null>(null);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('geminiAdventOpenedDays', JSON.stringify(Array.from(openedDays)));
  }, [openedDays]);

  // Initialize analytics only after user consent
  useEffect(() => {
    if (analyticsEnabled) {
      analytics.init().then(() => {
        analytics.trackOverrideActive(isOpenAllEnabled());
      }).catch(() => void 0);
    }
  }, [analyticsEnabled]);

  // Update current date every second to keep unlocks and status perfectly in sync
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(getCurrentLocalDate());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const handleDayClick = useCallback(async (day: CalendarDay, event?: React.MouseEvent) => {
    analytics.trackDoorClick(day.day);
    // Trigger particle burst at click location
    if (event) {
      setParticleBurst({ x: event.clientX, y: event.clientY });
    }

    setSelectedDay(day);
    setIsModalOpen(true);
    setIsLoading(true);

    // Trigger confetti on the first time day 24 is opened
    if (day.day === 24 && !openedDays.has(24)) {
      setShowConfetti(true);
      // Hide confetti after 10 seconds
      setTimeout(() => setShowConfetti(false), 10000);
    }

    if (!openedDays.has(day.day)) {
      setOpenedDays(prev => new Set(prev).add(day.day));
    }
    
    try {
      const content = await getDailySurprise(day.prompt, day.day);
      setModalContent(content);
      analytics.trackDoorOpen(day.day);
    } catch (error) {
      console.error('Error fetching surprise:', error);
      analytics.trackApiError('getDailySurprise', error instanceof Error ? error.message : String(error));
      setModalContent('There was a problem fetching your surprise. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [openedDays]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
    setModalContent('');
  };

  const decemberDay = getCurrentDecemberDay();
  const seasonStatus: 'pre' | 'during' | 'post' = decemberDay === 0
    ? 'pre'
    : decemberDay >= 25
      ? 'post'
      : 'during';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #0c1427, #1a202c, #2a314b)'}}>
       {showConfetti && <Confetti />}
       {particleBurst && (
         <ParticleBurst
           x={particleBurst.x}
           y={particleBurst.y}
           onComplete={() => setParticleBurst(null)}
         />
       )}
       <Snowfall />

      <div className="text-center mb-4 z-10">
        <h1 className="font-christmas text-5xl md:text-7xl text-yellow-300 drop-shadow-[0_3px_3px_rgba(0,0,0,0.7)]">Gemini Mastery</h1>
        <h2 className="font-christmas text-4xl md:text-6xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Advent Calendar</h2>
        <p className="text-gray-300 mt-2 text-lg">A daily dose of Gemini wisdom</p>

        <div className="mt-3 text-sm md:text-base text-gray-200 max-w-2xl mx-auto">
          <p>
            Open a new gift every day from <span className="font-semibold">December 1–24</span>. Each door unlocks at
            <span className="font-semibold"> midnight</span>, and you can revisit any opened day at any time.
          </p>
          {seasonStatus === 'pre' && (
            <p className="mt-1 text-gray-300">
              Doors are still locked for now. Check back on December 1 for your first surprise.
            </p>
          )}
          {seasonStatus === 'during' && (
            <p className="mt-1 text-gray-300">
              Presents with a warm glow are ready to open. Come back each day for the next gift.
            </p>
          )}
          {seasonStatus === 'post' && (
            <p className="mt-1 text-yellow-300 font-semibold">
              All 24 gifts are now unlocked — Happy Holidays! Explore any day again and download your Gemini Mastery PDF.
            </p>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      <CountdownTimer />

      <AdventGrid
        days={CALENDAR_DAYS}
        currentDate={currentDate}
        openedDays={openedDays}
        onDayClick={handleDayClick}
        shape={ornamentShape}
      />
      
      {selectedDay && (
        <SurpriseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          dayData={selectedDay}
          content={modalContent}
          isLoading={isLoading}
        />
      )}

      <footer className="text-center text-gray-400 text-sm py-4 z-10">
        <p>&copy; {new Date().getFullYear()} Happy Holidays!</p>
      </footer>

      {/* GDPR Cookie Consent Banner */}
      <CookieConsent
        onAccept={() => setAnalyticsEnabled(true)}
        onDecline={() => setAnalyticsEnabled(false)}
      />
    </div>
  );
};

export default App;
