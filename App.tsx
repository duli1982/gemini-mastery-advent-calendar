import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdventGrid } from './components/AdventGrid';
import { SurpriseModal } from './components/SurpriseModal';
import { CountdownTimer } from './components/CountdownTimer';
import { ParticleBurst } from './components/ParticleBurst';
import { getDailySurprise } from './services/geminiService';
import { CALENDAR_DAYS } from './constants';
import type { CalendarDay } from './types';
import { Confetti } from './components/Confetti';
import { getCurrentCETDate } from './utils/dateUtils';

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
  // Use real CET date instead of demo date
  const [currentDate, setCurrentDate] = useState(getCurrentCETDate());
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

  useEffect(() => {
    localStorage.setItem('geminiAdventOpenedDays', JSON.stringify(Array.from(openedDays)));
  }, [openedDays]);

  // Update current date every minute to check for new unlocks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(getCurrentCETDate());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleDayClick = useCallback(async (day: CalendarDay, event?: React.MouseEvent) => {
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
    } catch (error) {
      console.error('Error fetching surprise:', error);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 overflow-hidden" style={{background: 'linear-gradient(to bottom, #0c1427, #1a202c, #2a314b)'}}>
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
        <p className="text-gray-300 mt-2 text-lg">A daily dose of Gemini wisdom for Randstad GBS</p>
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
          day={selectedDay.day}
          content={modalContent}
          isLoading={isLoading}
        />
      )}

      <footer className="text-center text-gray-400 text-sm py-4 z-10">
        <p>&copy; {new Date().getFullYear()} Randstad GBS. Happy Holidays!</p>
      </footer>
    </div>
  );
};

export default App;