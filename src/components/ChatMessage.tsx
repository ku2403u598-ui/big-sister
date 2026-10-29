import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, AlertCircle, RotateCcw, HeartHandshake } from 'lucide-react';
import { Message } from '../types';
import { renderFormattedText } from '../utils/formatMarkdown';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
  isSpeaking: boolean;
  onToggleSpeech?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRetry,
  isSpeaking,
  onToggleSpeech,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures gracefully
    }
  };

  const formattedTime = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(message.timestamp));

  if (isUser) {
    return (
      <div className="flex w-full justify-end py-2">
        <div className="flex max-w-[85%] flex-col items-end sm:max-w-[75%]">
          {message.attachment && (
            <div className="mb-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
              <img
                src={message.attachment.previewUrl}
                alt="Uploaded receipt or document preview"
                className="max-h-48 w-auto object-cover"
              />
              <div className="bg-stone-50 px-2.5 py-1 text-[11px] text-stone-500 truncate max-w-xs">
                {message.attachment.name}
              </div>
            </div>
          )}
          <div className="rounded-2xl rounded-tr-xs bg-[#2B2927] px-4 py-2.5 text-[15px] leading-relaxed text-stone-50 shadow-xs">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <span className="mt-1 px-1 text-[11px] text-stone-600">
            {formattedTime}
          </span>
        </div>
      </div>
    );
  }

  // Model / Sister message
  return (
    <div className="flex w-full justify-start py-2.5">
      <div className="flex max-w-[95%] items-start gap-3 sm:max-w-[85%]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#B25329] to-[#D97746] text-white shadow-xs">
          <HeartHandshake className="h-4 w-4" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-stone-800">The Big Sister</span>
            <span className="text-[11px] text-stone-600">{formattedTime}</span>
          </div>

          <div
            className={`rounded-2xl rounded-tl-xs border px-4 py-3 shadow-xs ${
              message.isError
                ? 'border-red-200 bg-red-50/70 text-red-900'
                : 'border-stone-200/80 bg-white/90 text-stone-900'
            }`}
          >
            {message.isError ? (
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm">{message.text}</p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry message
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>{renderFormattedText(message.text)}</div>
            )}
          </div>

          {!message.isError && (
            <div className="mt-1.5 flex items-center gap-2 px-1">
              <button
                onClick={handleCopy}
                aria-label="Copy response to clipboard"
                className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-800 transition"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onToggleSpeech && (
                <button
                  onClick={() => onToggleSpeech(message.text)}
                  aria-label={isSpeaking ? 'Stop spoken playback' : 'Read response aloud'}
                  className={`flex items-center gap-1 text-[11px] transition ${
                    isSpeaking ? 'text-[#B25329] font-medium' : 'text-stone-600 hover:text-stone-800'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-3 w-3" />
                      <span>Stop reading</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3 w-3" />
                      <span>Read aloud</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
