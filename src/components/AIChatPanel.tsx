import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { mockChatMessages } from "@/lib/mockData";

interface AIChatPanelProps {
  query: string;
}

const AIChatPanel = ({ query }: AIChatPanelProps) => (
  <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
    <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
      <Bot className="h-5 w-5 text-primary" />
      <span className="text-sm font-semibold text-foreground">TANDA AI</span>
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto">
      {/* User query */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
      >
        {query}
      </motion.div>

      {/* AI responses */}
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
    </div>
  </div>
);

export default AIChatPanel;
