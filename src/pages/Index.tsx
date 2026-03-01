import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAIChat } from "@/hooks/useAIChat";
import SearchBar from "@/components/SearchBar";
import CarCard from "@/components/CarCard";
import AIChatPanel from "@/components/AIChatPanel";
import AISearchSkeleton from "@/components/AISearchSkeleton";
import PriceTracker from "@/components/PriceTracker";
import { suggestionTags } from "@/lib/mockData";
import { Bot, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCars } from "@/hooks/useCars";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type AppState = "LANDING" | "SEARCHING" | "RESULTS";

const Index = () => {
  const { profile } = useAuth();
  const [appState, setAppState] = useState<AppState>("LANDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const isMobile = useIsMobile();

  const { messages, isTyping, highlightedCarIds, sendMessage, startConversation } = useAIChat(
    profile?.name?.split(" ")[0]
  );

  const { data: cars = [], isLoading: carsLoading } = useCars(
    appState === "RESULTS" ? searchQuery : undefined
  );

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setAppState("SEARCHING");
      await startConversation(query);
      setAppState("RESULTS");
    },
    [startConversation]
  );

  const sortedCars = [...cars].sort((a, b) => {
    const aH = highlightedCarIds.includes(a.id) ? 0 : 1;
    const bH = highlightedCarIds.includes(b.id) ? 0 : 1;
    return aH - bH;
  });

  return (
    <div className="min-h-[calc(100vh-57px)] bg-background transition-colors duration-300">
      <PriceTracker />

      <AnimatePresence mode="wait">
        {appState === "LANDING" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4 text-center text-4xl font-bold leading-tight text-foreground sm:text-5xl"
            >
              Выбирай авто головой,
              <br />а не эмоциями
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 max-w-xl text-center text-base text-muted-foreground sm:text-lg"
            >
              Умный помощник, который знает всё о комплектациях дилеров Алматы
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full flex justify-center"
            >
              <SearchBar onSearch={handleSearch} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap justify-center gap-2"
            >
              {suggestionTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {appState === "SEARCHING" && (
          <AISearchSkeleton key="searching" />
        )}

        {appState === "RESULTS" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-7xl px-4 py-6"
          >
            {/* Desktop: 40/60 split */}
            <div className="hidden gap-6 md:grid md:grid-cols-[2fr_3fr] items-start">
              <div className="sticky top-[65px]">
                <AIChatPanel
                  messages={messages}
                  onSend={sendMessage}
                  isTyping={isTyping}
                />
              </div>
              <div className="grid gap-4 grid-cols-2">
                {carsLoading ? (
                  <div className="col-span-2 flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sortedCars.length === 0 ? (
                  <div className="col-span-2 text-center py-20 text-muted-foreground">
                    Ничего не найдено
                  </div>
                ) : (
                  sortedCars.map((car, i) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      index={i}
                      highlighted={highlightedCarIds.includes(car.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 flex justify-center"
              >
                <SearchBar onSearch={handleSearch} compact />
              </motion.div>
              <div className="grid gap-4 grid-cols-1">
                {carsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sortedCars.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    Ничего не найдено
                  </div>
                ) : (
                  sortedCars.map((car, i) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      index={i}
                      highlighted={highlightedCarIds.includes(car.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Mobile FAB */}
            {isMobile && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                onClick={() => setShowMobileChat(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg glow-primary"
                aria-label="Open AI Chat"
              >
                <Bot className="h-6 w-6 text-primary-foreground" />
                <span className="absolute inset-0 animate-fab-ping rounded-full bg-primary/40" />
              </motion.button>
            )}

            {/* Mobile chat drawer */}
            <Drawer open={showMobileChat} onOpenChange={setShowMobileChat}>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="pb-0">
                  <DrawerTitle className="flex items-center gap-2 text-base">
                    <Bot className="h-5 w-5 text-primary" />
                    TANDA AI
                  </DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col overflow-y-auto px-4 pb-6" style={{ maxHeight: "calc(85vh - 60px)" }}>
                  <AIChatPanel
                    messages={messages}
                    onSend={sendMessage}
                    isTyping={isTyping}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
