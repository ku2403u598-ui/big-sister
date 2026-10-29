import React from 'react';
import { HeartHandshake, RotateCcw, Settings, CheckSquare } from 'lucide-react';

interface HeaderProps {
  onClearClick: () => void;
  onSettingsClick: () => void;
  onTestsClick: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onClearClick,
  onSettingsClick,
  onTestsClick,
  messageCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#FAF8F5]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#B25329] to-[#D97746] text-white shadow-sm ring-1 ring-amber-900/10">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-stone-900 sm:text-lg">
                The Big Sister
              </h1>
              <span className="hidden rounded-full bg-amber-100/80 px-2 py-0.5 text-[11px] font-medium text-amber-900/80 sm:inline-block">
                Session only
              </span>
            </div>
            <p className="text-[12px] text-stone-500 line-clamp-1">
              A little help with everyday adulting in India
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {messageCount > 0 && (
            <button
              onClick={onClearClick}
              aria-label="Start fresh and clear current conversation"
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B25329]/40 active:scale-95"
              title="Start fresh (clears session)"
            >
              <RotateCcw className="h-3.5 w-3.5 text-stone-500" />
              <span className="hidden sm:inline">Start fresh</span>
            </button>
          )}

          <button
            onClick={onTestsClick}
            aria-label="Open test scenarios and evaluation suite"
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B25329]/40"
            title="Review evaluation test suite (T01-T14)"
          >
            <CheckSquare className="h-3.5 w-3.5 text-amber-700" />
            <span className="hidden sm:inline">Test Cases</span>
          </button>

          <button
            onClick={onSettingsClick}
            aria-label="Open settings and privacy info"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white/80 text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B25329]/40"
            title="Settings, voice preferences, and privacy information"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
