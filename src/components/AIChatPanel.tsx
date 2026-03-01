import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, ExternalLink, Send } from "lucide-react";
import { useState } from "react";
import { mockChatMessages, dealerLocations } from "@/lib/mockData";

interface AIChatPanelProps {
  query: string;
  onSearch?: (query: string) => void;
}

const AIChatPanel = ({ query, onSearch }: AIChatPanelProps) => {
  const [showRoutes, setShowRoutes] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSearch) {
      onSearch(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Scrollable messages area */}
      <div className="max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          {query}
        </motion.div>

        {mockChatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.4 }}
            className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2 text-sm text-secondary-foreground whitespace-pre-line"
          >
            {msg.text}
          </motion.div>
        ))}

        {/* Route suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
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
                      transition={{ delay: i * 0.1 }}
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
      </div>

      {/* Chat input — directly below messages, no gap */}
      {onSearch && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onSubmit={handleSubmit}
          className="mt-2.5 flex items-center gap-2 rounded-xl border border-border bg-background p-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Задайте вопрос..."
            className="flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
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
