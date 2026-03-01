import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/components/AIChatPanel";

export function useAIChat(userName?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedCarIds, setHighlightedCarIds] = useState<string[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const { data, error } = await supabase.functions.invoke("ai-car-consultant", {
          body: {
            message: text,
            history: [...messages, userMsg].slice(-10), // last 10 messages for context
            userName,
          },
        });

        if (error) throw error;

        const aiMsg: ChatMessage = { role: "assistant", text: data.text };
        setMessages((prev) => [...prev, aiMsg]);

        if (data.recommendedIds?.length) {
          setHighlightedCarIds(data.recommendedIds);
        }
      } catch (err) {
        console.error("AI chat error:", err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Извините, произошла ошибка. Попробуйте ещё раз." },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, userName]
  );

  const startConversation = useCallback(
    async (query: string) => {
      setMessages([]);
      setHighlightedCarIds([]);
      await sendMessage(query);
    },
    [sendMessage]
  );

  return { messages, isTyping, highlightedCarIds, sendMessage, startConversation };
}
