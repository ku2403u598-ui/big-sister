import React from 'react';
import { X, Shield, Sparkles, Volume2, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';
import { PersonaStyle } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearConversation: () => void;
  personaStyle: PersonaStyle;
  onChangePersonaStyle: (style: PersonaStyle) => void;
  autoReadAloud: boolean;
  onToggleAutoReadAloud: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearConversation,
  personaStyle,
  onChangePersonaStyle,
  autoReadAloud,
  onToggleAutoReadAloud,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-stone-200 bg-[#FAF8F5] p-5 shadow-xl sm:p-6 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
          <div className="flex items-center gap-2">
            <h3 id="settings-modal-title" className="text-base font-semibold text-stone-900">
              Settings & Privacy
            </h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
              About The Big Sister
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5 text-sm text-stone-700">
          {/* Persona nuance preference */}
          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-stone-700">
              Conversation Tone Style
            </label>
            <p className="mt-0.5 text-xs text-stone-600">
              Choose how The Big Sister paces and phrases guidance (all modes maintain zero-judgment & practical choices).
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {(['practical', 'gentle', 'chatty'] as PersonaStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChangePersonaStyle(style)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-medium capitalize transition ${
                    personaStyle === style
                      ? 'border-[#B25329] bg-amber-50/70 text-[#B25329] ring-1 ring-[#B25329]'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <Sparkles className="mb-1 h-3.5 w-3.5 text-amber-700" />
                  <span>{style}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice options */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="h-4 w-4 text-stone-600" />
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">
                    Auto-read Sister replies aloud
                  </span>
                  <span className="text-[12px] text-stone-600">
                    Spoken playback using browser speech synthesis
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoReadAloud}
                onChange={onToggleAutoReadAloud}
                className="h-4 w-4 rounded border-stone-300 text-[#B25329] focus:ring-[#B25329]"
              />
            </div>
          </div>

          {/* Privacy & Session-Only Memory */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900">
              <Shield className="h-4 w-4 text-emerald-700" />
              <span>Session-Only Memory & Privacy</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>
                <strong>No cross-session storage:</strong> Everything stays in your current session memory. Refreshing or clicking "Start fresh" resets the conversation.
              </li>
              <li>
                <strong>No bank or account links:</strong> We do not connect to your bank, UPI handles, or payment services. We never take financial actions.
              </li>
              <li>
                <strong>Redact sensitive details:</strong> Never share UPI PINs, passwords, OTPs, or full card numbers. Crop them out of receipts before attaching.
              </li>
            </ul>
          </div>

          {/* Boundaries & Crisis Disclosure */}
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-3.5 text-xs leading-relaxed text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <span>Boundaries & Helpline Support</span>
            </div>
            <p className="text-stone-600">
              The Big Sister is an AI assistant, not a financial planner, tax adviser, lawyer, or therapist. For genuine debt emergencies or mental distress, please connect with trusted humans or official hotlines:
            </p>
            <div className="mt-1 flex flex-wrap gap-2 pt-1 font-medium text-stone-700">
              <span className="rounded bg-white/90 px-2 py-0.5 border border-amber-200">
                Mental Health (Tele-MANAS): <strong>14416</strong>
              </span>
              <span className="rounded bg-white/90 px-2 py-0.5 border border-amber-200">
                National Helpline (KIRAN): <strong>1800-599-0019</strong>
              </span>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onClearConversation();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 px-4 py-2.5 text-xs font-semibold text-red-800 hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Start Fresh (Clear Current Conversation)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
