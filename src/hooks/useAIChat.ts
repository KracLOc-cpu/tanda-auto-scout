import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/components/AIChatPanel";

export interface CarFilters {
  price_max?: number | null;
  price_min?: number | null;
  brands?: string[] | null;
  drive?: string | null;
  transmission?: string | null;
  clearance_min?: number | null;
  engine_type?: string | null;
}

export function useAIChat(userName?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedCarIds, setHighlightedCarIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<CarFilters>({});
  const [noExactMatch, setNoExactMatch] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setNoExactMatch(false);

      try {
        const { data, error } = await supabase.functions.invoke("ai-car-consultant", {
          body: {
            message: text,
            history: [...messages, userMsg].slice(-10),
            userName,
            currentFilters: filters,
          },
        });

        if (error) throw error;

        const aiMsg: ChatMessage = { role: "assistant", text: data.text };
        setMessages((prev) => [...prev, aiMsg]);

        if (data.recommendedIds?.length) {
          setHighlightedCarIds(data.recommendedIds);
        }

        // Merge new filters with existing (cumulative)
        if (data.filters) {
          setFilters((prev) => {
            const merged = { ...prev };
            for (const [key, value] of Object.entries(data.filters)) {
              if (value === null) {
                delete merged[key as keyof CarFilters];
              } else {
                (merged as any)[key] = value;
              }
            }
            return merged;
          });
        }

        if (data.noExactMatch) {
          setNoExactMatch(true);
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
    [messages, userName, filters]
  );

  const startConversation = useCallback(
    async (query: string) => {
      setMessages([]);
      setHighlightedCarIds([]);
      setFilters({});
      setNoExactMatch(false);
      await sendMessage(query);
    },
    [sendMessage]
  );

  const loosenFilters = useCallback(() => {
    setFilters((prev) => {
      const loosened = { ...prev };
      // Increase price by 20%
      if (loosened.price_max) loosened.price_max = Math.round(loosened.price_max * 1.2);
      // Lower clearance requirement by 20mm
      if (loosened.clearance_min) loosened.clearance_min = Math.max(0, loosened.clearance_min - 20);
      // Remove brand restriction
      delete loosened.brands;
      return loosened;
    });
    setNoExactMatch(false);
  }, []);

  return {
    messages,
    isTyping,
    highlightedCarIds,
    filters,
    noExactMatch,
    sendMessage,
    startConversation,
    loosenFilters,
  };
}
