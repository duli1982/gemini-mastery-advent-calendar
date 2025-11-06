# Gemini Mastery Advent Calendar

A festive 24-day advent calendar application for Randstad GBS, featuring daily Gemini AI-powered content, interactive gift-box animations, and CET timezone-based unlocking.

## Features

- **24 Days of Content**: Interactive advent calendar with 24 daily gifts
- **CET Timezone Unlocking**: Days 2-24 unlock at 00:01 CET each day (Day 1 is always available)
- **Real-time Countdown**: Live countdown timer showing time until next gift unlock
- **Festive Animations**:
  - Gift unwrapping animation with ribbons and bow
  - Particle burst effects when opening gifts
  - Snowfall background animation
  - Special confetti celebration for Day 24
- **Gemini AI Integration**: Daily content powered by Google's Gemini API
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Progress Tracking**: Automatically saves which days you've opened

## Tech Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI**: Google Gemini API (@google/genai)
- **Markdown Rendering**: Marked library
- **Styling**: Tailwind CSS (via inline styles)

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Google Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd gemini-mastery-advent-calendar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env and add your Gemini API key
   # GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment to Vercel

### Method 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add your environment variable in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key value
   - Make sure it's available for Production, Preview, and Development

5. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### Method 2: Deploy via GitHub Integration

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key
   - Select all environments (Production, Preview, Development)

7. Click "Deploy"

### Method 3: Deploy Button (One-Click)

If you want to add a "Deploy to Vercel" button to your repository:

1. Add this to your README:
   ```markdown
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-github-repo-url>)
   ```

2. Users clicking the button will be prompted to add the `GEMINI_API_KEY` environment variable

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for content generation | Yes (for days 2-24) | - |

**Note**: Day 1 displays a static message and doesn't require the API key.

## Project Structure

```
gemini-mastery-advent-calendar/
├── components/
│   ├── AdventGrid.tsx          # Main grid layout with 24 gift boxes
│   ├── Confetti.tsx             # Confetti animation for Day 24
│   ├── CountdownTimer.tsx       # Real-time countdown to next unlock
│   ├── Ornament.tsx             # Individual gift box with animations
│   ├── ParticleBurst.tsx        # Particle effects on click
│   └── SurpriseModal.tsx        # Modal displaying daily content
├── services/
│   └── geminiService.ts         # Gemini API integration
├── utils/
│   └── dateUtils.ts             # CET timezone utilities
├── constants.ts                 # 24 days of prompts/content
├── types.ts                     # TypeScript type definitions
├── App.tsx                      # Main application component
├── main.tsx                     # Application entry point
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## How It Works

### Unlocking Mechanism

- **Day 1**: Always available for testing and demonstration
- **Days 2-24**: Unlock at 00:01 CET on their respective dates in December
- **Timezone**: Uses CET (Central European Time) via Intl API
- **Progress Saving**: Opened days are saved in browser localStorage

### Content Generation

- **Day 1**: Displays a static prompt about "Elf Mode JD" for job description summarization
- **Days 2-24**: Use Google Gemini API to generate festive, educational content based on predefined prompts

### Animations

1. **Unwrap Animation**: 800ms sequence when clicking a gift
   - Gift box shakes
   - Ribbons slide away
   - Bow flies off with rotation
   - Modal opens with content

2. **Particle Burst**: 25 particles with physics simulation
   - Emojis and colored shapes
   - Gravity and rotation effects
   - 1.5 second animation

## Customization

### Adding/Editing Daily Content

Edit `constants.ts` to modify the prompts for each day:

```typescript
export const CALENDAR_DAYS: CalendarDay[] = [
  { day: 1, prompt: "Your Day 1 message..." },
  { day: 2, prompt: "Your Day 2 prompt for Gemini..." },
  // ... etc
];
```

### Changing Unlock Times

Modify the unlock logic in `utils/dateUtils.ts`:

```typescript
// Currently unlocks at 00:01 CET
// Change the time in getDayUnlockTime() function
```

### Styling

The app uses inline Tailwind-style classes. Modify component files to change:
- Colors in `Ornament.tsx` (giftColors array)
- Layout in `AdventGrid.tsx`
- Background in `App.tsx`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Copyright 2025 Randstad GBS. All rights reserved.

## Support

For issues or questions, please contact the Randstad GBS development team.

Happy Holidays!
