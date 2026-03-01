import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { mockChatMessages } from "@/lib/mockData";
import { useIsMobile } from "@/hooks/use-mobile";

interface AIChatPanelProps {
  query: string;
}

const AIChatPanel = ({ query }: AIChatPanelProps) => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(!isMobile);
  const [showRoutes, setShowRoutes] = useState(false);

  if (isMobile) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">TANDA AI</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ChatContent query={query} showRoutes={showRoutes} setShowRoutes={setShowRoutes} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <Bot className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">TANDA AI</span>
      </div>
      <ChatContent query={query} showRoutes={showRoutes} setShowRoutes={setShowRoutes} />
    </div>
  );
};

const ChatContent = ({
  query,
  showRoutes,
  setShowRoutes,
}: {
  query: string;
  showRoutes: boolean;
  setShowRoutes: (v: boolean) => void;
}) => (
  <div className="flex-1 space-y-4 overflow-y-auto p-4 pt-0 md:p-0">
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
    >
      {query}
    </motion.div>

    {mockChatMessages.map((msg, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 + i * 0.4 }}
        className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm text-secondary-foreground whitespace-pre-line"
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
            <div className="space-y-2 p-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="text-foreground">пр. Суюнбая 155</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="text-foreground">Кульджинский тракт 8/4</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
);

export default AIChatPanel;
