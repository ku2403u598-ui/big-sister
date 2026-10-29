/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeState } from './components/WelcomeState';
import { ChatMessage } from './components/ChatMessage';
import { ChatComposer } from './components/ChatComposer';
import { SettingsModal } from './components/SettingsModal';
import { TestScenariosModal } from './components/TestScenariosModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Message, ChatAttachment, PersonaStyle } from './types';
import { HeartHandshake } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Session-only memory for current tab
    try {
      const saved = sessionStorage.getItem('big_sister_session_msgs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [personaStyle, setPersonaStyle] = useState<PersonaStyle>('practical');
  const [autoReadAloud, setAutoReadAloud] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to session storage (transient for current browser tab only)
  useEffect(() => {
    try {
      sessionStorage.setItem('big_sister_session_msgs', JSON.stringify(messages));
    } catch {
      // Ignore sessionStorage limits
    }
  }, [messages]);

  // Scroll into view when new messages appear
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Text-to-Speech (read aloud)
  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isSpeaking && speakingText === text) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingText(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown asterisks and symbols for cleaner narration
    const cleanSpeech = text
      .replace(/[*#`_]/g, '')
      .replace(/₹/g, ' rupees ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try finding an English or Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.includes('en-IN')) ||
      voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop speech if unmounting or clearing
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (text: string, attachment?: ChatAttachment) => {
    if (isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
      attachment,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build history for backend
      const historyPayload = messages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          image: attachment
            ? {
                data: attachment.data,
                mimeType: attachment.mimeType,
                name: attachment.name,
              }
            : undefined,
          personaStyle,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText =
          data.error ||
          "I ran into a temporary issue thinking through that. Let's try sending it again.";
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'model',
            text: errorText,
            timestamp: Date.now(),
            isError: true,
          },
        ]);
        return;
      }

      const replyText = data.reply || 'I hear you. Could you share a bit more detail?';
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);

      if (autoReadAloud) {
        toggleSpeech(replyText);
      }
    } catch (err: any) {
      console.error('Network or server error during chat:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: "We couldn't reach the server right now. Check your internet connection and click retry below.",
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLast = () => {
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove any trailing error message
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.isError) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSendMessage(lastUserMessage.text, lastUserMessage.attachment);
    }
  };

  const handleClearConversation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingText(null);
    setMessages([]);
    try {
      sessionStorage.removeItem('big_sister_session_msgs');
    } catch {
      // Ignore
    }
    setIsConfirmClearOpen(false);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#FAF8F5] text-stone-900 overflow-hidden">
      {/* Header */}
      <Header
        onClearClick={() => setIsConfirmClearOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onTestsClick={() => setIsTestsOpen(true)}
        messageCount={messages.length}
      />

      {/* Main Conversation viewport */}
      <main className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-start">
          {messages.length === 0 ? (
            <div className="w-full my-auto py-2">
              <WelcomeState onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={message.isError ? handleRetryLast : undefined}
                  isSpeaking={isSpeaking && speakingText === message.text}
                  onToggleSpeech={toggleSpeech}
                />
              ))}

              {/* Loading thinking indicator */}
              {isLoading && (
                <div className="flex w-full justify-start py-2.5">
                  <div className="flex max-w-[85%] items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#B25329] to-[#D97746] text-white shadow-xs animate-pulse">
                      <HeartHandshake className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs border border-stone-200/80 bg-white/90 px-4 py-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-600">The Big Sister is thinking...</span>
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#B25329] animate-bounce [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#B25329] animate-bounce [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#B25329] animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Composer */}
      <ChatComposer onSendMessage={handleSendMessage} isLoading={isLoading} />

      {/* Settings & Privacy Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearConversation={() => setIsConfirmClearOpen(true)}
        personaStyle={personaStyle}
        onChangePersonaStyle={setPersonaStyle}
        autoReadAloud={autoReadAloud}
        onToggleAutoReadAloud={() => setAutoReadAloud((prev) => !prev)}
      />

      {/* Test Scenarios Evaluation Suite */}
      <TestScenariosModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
        onRunInChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Start Fresh Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onConfirm={handleClearConversation}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
}
