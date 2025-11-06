import React from 'react';

export const SantaSleigh: React.FC = () => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[5] overflow-x-hidden">
        <div className="absolute top-[8%] w-48 md:w-56 h-auto animate-fly-across will-change-transform">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 70"
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'
            }}
          >
            {/* Reindeer */}
            <g transform="translate(-10, 0)">
              {/* Rudolph */}
              <g transform="translate(10, 15)">
                  <path d="M25,25 a5,15 0 0,1 10,-15 l5,-5" fill="none" stroke="#a0522d" strokeWidth="1.5" />
                  <path d="M35,10 a5,15 0 0,0 10,-5 l5,-5" fill="none" stroke="#a0522d" strokeWidth="1.5" />
                  <ellipse cx="30" cy="30" rx="10" ry="5" fill="#8b4513" />
                  <circle cx="22" cy="28" r="1.5" fill="#000" />
                  <circle cx="21" cy="29" r="1" fill="#ff0000" />
              </g>
              {/* Second Reindeer */}
              <g transform="translate(60, 15)">
                  <path d="M25,25 a5,15 0 0,1 10,-15 l5,-5" fill="none" stroke="#a0522d" strokeWidth="1.5" />
                  <path d="M35,10 a5,15 0 0,0 10,-5 l5,-5" fill="none" stroke="#a0522d" strokeWidth="1.5" />
                  <ellipse cx="30" cy="30" rx="10" ry="5" fill="#8b4513" />
                  <circle cx="22" cy="28" r="1.5" fill="#000" />
              </g>
            </g>

            {/* Harness */}
            <line x1="45" y1="32" x2="130" y2="48" stroke="#d2b48c" strokeWidth="0.5" />
            <line x1="95" y1="32" x2="130" y2="48" stroke="#d2b48c" strokeWidth="0.5" />

            {/* Sleigh */}
            <g fill="#c41e3a" transform="translate(0, 5)">
              <path d="M145.8,55.2c-2.4-2.4-3.8-5.8-3.8-9.4c0-3.6,1.4-7,3.8-9.4c1.1-1.1,2.6-1.8,4.2-1.8h20.6c3.3,0,6,2.7,6,6v8.4 c0,3.3-2.7,6-6,6h-20.6C148.4,57,146.9,56.3,145.8,55.2z" />
              <path d="M170.6,34.6h-20.6c-1.3,0-2.6,0.5-3.5,1.5c-1.9,1.9-3,4.5-3,7.1s1.1,5.2,3,7.1c1,1,2.2,1.5,3.5,1.5h2.1v10.5 c0,1.7,1.3,3,3,3s3-1.3,3-3V51.8h12.5c1.7,0,3-1.3,3-3v-8.4C173.6,35.9,172.3,34.6,170.6,34.6z" />
              <path d="M198.8,40.4c-0.8,0-1.5,0.7-1.5,1.5v5.1c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5v-5.1 C200.3,41.1,199.6,40.4,198.8,40.4z" />
              <path d="M136,54.8c-2.8,0-5.1-2.3-5.1-5.1c0-2.8,2.3-5.1,5.1-5.1c2.8,0,5.1,2.3,5.1,5.1 C141.1,52.5,138.8,54.8,136,54.8z M136,46.6c-1.7,0-3.1,1.4-3.1,3.1c0,1.7,1.4,3.1,3.1,3.1c1.7,0,3.1-1.4,3.1-3.1 C139.1,48,137.7,46.6,136,46.6z" />
            </g>
            <path d="M130,68 C120,80 200,80 195,68" stroke="#ffd700" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
      </div>
      <style>{`
        @keyframes fly-across {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
        .animate-fly-across {
          animation: fly-across 20s linear infinite;
          animation-delay: 2s;
        }
        
        @keyframes santa-bob {
          0%, 100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-1.5px) rotate(-3deg);
          }
        }
        .santa-figure {
          transform-origin: 50% 80%; /* Set pivot point for rotation */
          animation: santa-bob 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
