import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl sm:p-6 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-900 mb-3">
          <RotateCcw className="h-5 w-5" />
        </div>

        <h3 id="confirm-modal-title" className="text-base font-semibold text-stone-900">
          Start fresh?
        </h3>

        <p className="mt-2 text-xs text-stone-600 leading-relaxed">
          This will clear all messages and any temporary attachments from your current session. Because we don't save personal memory across sessions, you will start with a clean slate.
        </p>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-stone-200 bg-white py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            Keep talking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-700 py-2 text-xs font-semibold text-white hover:bg-red-800 transition active:scale-95 shadow-xs"
          >
            Clear session
          </button>
        </div>
      </div>
    </div>
  );
};
