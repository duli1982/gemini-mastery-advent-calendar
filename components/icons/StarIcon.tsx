
import React from 'react';

export const StarIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-full h-full"
    style={{ filter: "drop-shadow(0 0 10px #fef08a)" }}
  >
    <defs>
      <radialGradient id="starGradient">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#facc15" />
      </radialGradient>
    </defs>
    <path
      fill="url(#starGradient)"
      stroke="#ca8a04"
      strokeWidth="0.5"
      d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 4.517 1.48-8.279L0 9.306l8.332-1.151z"
    />
  </svg>
);
