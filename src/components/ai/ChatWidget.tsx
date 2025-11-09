import { useEffect, useMemo, useRef, useState } from "react";
import { aiAPI } from "../../services/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "gcet_ai_chat_history";

interface ChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ChatWidget({ isOpen: isOpenProp, onClose: onCloseProp }: ChatWidgetProps = {}) {
  const [isOpenState, setIsOpenState] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Use prop or internal state for isOpen
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenState;
  const isControlled = isOpenProp !== undefined;

  // Load cached history
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        setMessages(parsed);
      }
    } catch {}
  }, []);

  // Persist history
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    setIsSending(true);
    try {
      const res = await aiAPI.chat(text);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res?.reply || "",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err?.response?.data?.error || "Sorry, I couldn't reach GCET AI right now. Please try again.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) void sendMessage();
    }
  };

  const handleToggle = () => {
    if (onCloseProp) {
      onCloseProp();
    } else {
      setIsOpenState((v) => !v);
    }
  };

  return (
    <>
      {/* Floating button - only show if not controlled */}
      {!isControlled && (
        <button
          type="button"
          onClick={handleToggle}
          className="fixed bottom-5 right-5 z-40 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 px-4 py-3"
          aria-expanded={isOpen}
          aria-controls="gcet-ai-chat"
        >
          {isOpen ? "Close GCET AI" : "Ask GCET AI"}
        </button>
      )}

      {/* Panel */}
      <div
        id="gcet-ai-chat"
        className={`${isControlled ? "relative" : "fixed bottom-20 right-5"} z-40 w-[360px] max-w-[92vw] transition-all ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-2"
        }`}
      >
        <div className="flex h-[480px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-semibold">GCET AI Assistant</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMessages([])}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
              {isControlled && onCloseProp && (
                <button
                  type="button"
                  onClick={onCloseProp}
                  className="text-lg text-gray-500 hover:text-gray-700 ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-2 overflow-auto px-3 py-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-xs text-gray-500">
                Ask about campus blocks, exam schedules, or faculty. Example: "Where is A Block?"
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question…"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!canSend}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
