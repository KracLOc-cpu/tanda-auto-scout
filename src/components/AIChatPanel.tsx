import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, ExternalLink, Send, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { dealerLocations } from "@/lib/mockData";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface UpsellDisplay {
  new_price_max: number;
  car_names: string[];
  extra_amount: number;
}

interface AIChatPanelProps {
  messages: ChatMessage[];
  onSend?: (text: string) => void;
  isTyping?: boolean;
  upsell?: UpsellDisplay | null;
  onExpandBudget?: () => void;
}

// Простой Markdown → JSX рендерер
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Пустая строка — отступ
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-1" />);
      continue;
    }

    // Строка с эмодзи-буллетом: 🔹 или • или -
    if (/^[🔹🔸✅❌⚡🚗💰•\-]\s/.test(line.trim())) {
      elements.push(
        <div key={key++} className="flex gap-2 py-0.5">
          <span className="shrink-0">{line.trim().slice(0, /^\p{Emoji}/u.test(line.trim()) ? 2 : 1)}</span>
          <span>{renderInline(line.trim().replace(/^[🔹🔸✅❌⚡🚗💰•\-]\s*/, ""))}</span>
        </div>
      );
      continue;
    }

    // Обычная строка
    elements.push(
      <p key={key++} className="py-0.5 leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  return elements;
}

// Рендер **жирного** и _курсива_ внутри строки
function renderInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  // Матчим **bold** и *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let key = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const AIChatPanel = ({ messages, onSend, isTyping, upsell, onExpandBudget }: AIChatPanelProps) => {
  const [showRoutes, setShowRoutes] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSend) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col">
      <div
        ref={scrollRef}
        className="max-h-[60vh] space-y-3 overflow-y-auto scroll-smooth overscroll-contain pr-1"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-2"
          >
            {msg.role === "user" ? (
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {msg.text}
              </div>
            ) : (
              <div className="mr-auto max-w-[95%]">
                <div className="mb-1 flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">TANDA AI</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mr-auto"
          >
            <div className="mb-1 flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">TANDA AI</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          </motion.div>
        )}

        {/* Upsell */}
        {upsell && !isTyping && onExpandBudget && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1"
          >
            <button
              onClick={onExpandBudget}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              💰 Показать варианты +{(upsell.extra_amount / 1_000).toFixed(0)}к к бюджету
            </button>
          </motion.div>
        )}

        {/* Маршруты — после 3 сообщений */}
        {messages.length >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <MapPin className="h-4 w-4" />
              Построить маршрут в Алматы
            </button>
            <AnimatePresence>
              {showRoutes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden rounded-lg border border-border bg-secondary/50 text-sm"
                >
                  <div className="space-y-1 p-3">
                    {dealerLocations.map((loc, i) => (
                      <motion.a
                        key={i}
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address + ", Алматы")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-secondary"
                      >
                        <Navigation className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">{loc.address}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-xs font-medium text-primary">{loc.distance}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Поле ввода */}
      {onSend && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="sticky bottom-0 mt-3 flex items-center gap-2 rounded-xl border border-border bg-background p-2 pt-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Уточните запрос..."
            className="flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </motion.form>
      )}
    </div>
  );
};

export default AIChatPanel;
