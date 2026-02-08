"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2 } from "lucide-react";

interface ChatWidgetProps {
  reportText: string;
}

export default function ChatWidget({ reportText }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { reportText },
      }),
    [reportText],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messages: [
      {
        id: "welcome",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text: "Hi! I'm your Nawgati analyst. Ask me anything about this fuel station — financials, competitors, risks, scores, or any specific detail from the report.",
          },
        ],
      },
    ] satisfies UIMessage[],
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const getMessageText = (msg: typeof messages[0]): string => {
    return msg.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("");
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold text-white">Nawgati Analyst</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: "welcome-reset",
                      role: "assistant",
                      parts: [
                        {
                          type: "text",
                          text: "Chat cleared! Ask me anything about this fuel station report.",
                        },
                      ],
                    },
                  ])
                }
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
            {messages.map((m) => {
              const text = getMessageText(m);
              if (!text) return null;
              const role = m.role as string;
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      role === "user"
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {role === "assistant" ? (
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />
                    ) : (
                      text
                    )}
                  </div>
                  {role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2 items-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex gap-1 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this station..."
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/** Simple markdown-ish formatting for assistant messages */
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>')
    .replace(/^- (.+)$/gm, "• $1")
    .replace(/\n/g, "<br/>");
}
