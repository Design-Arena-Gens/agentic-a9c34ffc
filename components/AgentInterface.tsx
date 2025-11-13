'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

type AgentMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type AgentState = 'idle' | 'thinking' | 'error';

const initialGreeting: AgentMessage = {
  id: 'greeting',
  role: 'assistant',
  content:
    'Namaste! Main aapka chhota sa Jarvis hoon. Bataiye, aaj aapke liye kaunsa mission tayyar karna hai?',
};

export function AgentInterface() {
  const [messages, setMessages] = useState<AgentMessage[]>([initialGreeting]);
  const [input, setInput] = useState('');
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentState]);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && agentState !== 'thinking';
  }, [input, agentState]);

  async function handleSend() {
    if (!canSend) return;

    const trimmed = input.trim();
    const newUserMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    setInput('');
    setMessages((prev) => [...prev, newUserMessage]);
    setAgentState('thinking');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Agent ko response nahi mila.');
      }

      const payload = (await response.json()) as { text: string };
      const cleaned = payload.text?.trim() ?? '';

      if (!cleaned) {
        throw new Error('Agent ne kuchh nahi kaha — phir se koshish karein.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: cleaned,
        },
      ]);
      setAgentState('idle');
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : 'Kuch toh gadbad hai. Thodi der baad fir se try karein.';

      setErrorMessage(fallback);
      setAgentState('error');
      setTimeout(() => setAgentState('idle'), 2500);
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="floating-orbs pointer-events-none" />
      <div className="floating-orbs floating-orbs--alt pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-950" />
      <div className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:p-8">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300/60">
                  Live link established
                </p>
                <h1 className="text-3xl font-semibold text-white md:text-4xl">
                  JarviSpark Session
                </h1>
              </div>
              <div className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 shadow-lg shadow-indigo-500/10 transition hover:border-indigo-400/60 hover:text-white">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                Friendly Online
              </div>
            </div>

            <div className="relative mt-10 flex flex-1 flex-col items-center justify-center overflow-hidden">
              <div className="hologram-ring absolute inset-x-0 top-2 h-24 blur-3xl" />
              <div className="hologram-base relative flex h-[18rem] w-full items-center justify-center overflow-visible">
                <div className="orbital-path pointer-events-none absolute inset-x-4 bottom-4 top-auto h-28 rounded-full border border-dashed border-cyan-400/20" />
                <div className="bot-runway pointer-events-none absolute inset-x-16 bottom-10 h-1 rounded-full bg-cyan-200/20 blur-md" />
                <div className="bot-glider">
                  <div className="bot-actor">
                    <div className="bot-core">
                      <div className="bot-face">
                        <span className="bot-eye" />
                        <span className="bot-eye" />
                      </div>
                      <div className="bot-mouth" />
                    </div>
                    <div className="bot-body">
                      <span />
                      <span />
                    </div>
                    <div className="bot-legs">
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative mt-6 w-full max-w-md rounded-3xl border border-cyan-200/30 bg-cyan-500/10 p-4 text-center text-base text-cyan-100 shadow-cyan-500/20 backdrop-blur-md">
                {agentState === 'thinking' ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                    <p className="text-sm uppercase tracking-[0.4em] text-cyan-200/80">
                      Processing your mission...
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-cyan-50">
                      JarviSpark: Aapka AI dost
                    </p>
                    <p className="mt-1 text-sm text-cyan-100/80">
                      “Mission assign kijiye, aur main bina thake usse execute
                      karne ki planning turant shuru kar deta hoon.”
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel flex max-h-[720px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">
              Command Center
            </h2>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200/70">
              Conversation
            </span>
          </div>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`relative max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg shadow-slate-900/30 ${
                    message.role === 'user'
                      ? 'bg-indigo-500/90 text-white'
                      : 'bg-white/80 text-slate-900'
                  }`}
                >
                  {message.content}
                  {message.role === 'assistant' && (
                    <span className="pointer-events-none absolute -left-10 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/70 text-xs font-semibold uppercase tracking-wide text-slate-900">
                      AI
                    </span>
                  )}
                </div>
              </div>
            ))}

            {agentState === 'thinking' && (
              <div className="flex justify-start">
                <div className="rounded-3xl bg-white/60 px-4 py-3 text-sm text-slate-900">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {errorMessage && agentState === 'error' && (
              <div className="flex justify-center">
                <div className="rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
                  {errorMessage}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-inner shadow-black/30">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Aaj ka mission batayein... (Enter se bhejein, Shift + Enter se nayi line)"
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 p-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300/70">
              <span>
                Gemini 1.5 Flash · Conversational Planning · Hindi/English mix
              </span>
              <span>Latency optimized for mobile networks</span>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-400/40 bg-cyan-500/40 py-3 text-base font-semibold text-white transition hover:bg-cyan-400/70 focus:outline-none focus:ring-4 focus:ring-cyan-400/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/40 shadow-inner shadow-black/60 backdrop-blur group-hover:bg-black/60">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 11L12 6L17 11"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 18V7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              Deploy Mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
