import React from 'react';
import { Sparkles, ShieldCheck, Compass, HelpCircle } from 'lucide-react';

interface WelcomeStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Where salary goes',
    text: 'Help me understand where my salary goes',
    description: 'Break down your take-home pay simply',
  },
  {
    title: 'Moving to a hostel / PG',
    text: 'I’m moving into a hostel—what should I budget for?',
    description: 'Deposits, mess fees, and hidden essentials',
  },
  {
    title: 'Make sense of expenses',
    text: 'Can you help me make sense of these expenses?',
    description: 'Separate fixed costs from flexible spending',
  },
  {
    title: 'Split rent & fun money',
    text: 'How do I split rent, groceries, and fun money?',
    description: 'Realistic balance without feeling deprived',
  },
];

export const WelcomeState: React.FC<WelcomeStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-2 py-3 text-center sm:px-4 sm:py-8">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-900">
        <Sparkles className="h-3.5 w-3.5 text-amber-700" />
        <span>Non-judgmental money & life companion</span>
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-3xl font-serif-title">
        Adulting is a lot. <br className="hidden sm:inline" />
        Let’s figure it out together.
      </h2>

      <p className="mt-2 max-w-lg text-xs sm:text-base text-stone-600 leading-relaxed">
        Whether you just started earning, moved to a new city, or feel like money slips through your fingers—no shame, no rigid spreadsheets. Just practical next steps.
      </p>

      {/* Starter Prompts */}
      <div className="mt-5 sm:mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 text-left">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt.title}
            onClick={() => onSelectPrompt(prompt.text)}
            className="group flex flex-col justify-between rounded-xl border border-stone-200/90 bg-white/70 p-3.5 text-left shadow-xs transition hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B25329]/40 active:scale-[0.99]"
          >
            <span className="text-[14px] font-semibold text-stone-800 group-hover:text-amber-900">
              "{prompt.text}"
            </span>
            <span className="mt-1 text-[12px] text-stone-500 line-clamp-1">
              {prompt.description}
            </span>
          </button>
        ))}
      </div>

      {/* Gentle reassurance pillars */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Zero judgment on personal spending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-amber-700" />
          <span>Calculates what remains, not rigid rules</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-stone-600" />
          <span>Session only • No bank link needed</span>
        </div>
      </div>
    </div>
  );
};
