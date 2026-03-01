import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import CarCard from "@/components/CarCard";
import AIChatPanel from "@/components/AIChatPanel";
import PriceTracker from "@/components/PriceTracker";
import { mockCars, suggestionTags } from "@/lib/mockData";

type Step = "landing" | "results";

const Index = () => {
  const [step, setStep] = useState<Step>("landing");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("results");
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-background transition-colors duration-300">
      <PriceTracker />

      <AnimatePresence mode="wait">
        {step === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35 }}
            className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4"
          >
            <h1 className="mb-4 text-center text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Выбирай авто головой,
              <br />а не эмоциями
            </h1>
            <p className="mb-10 max-w-xl text-center text-base text-muted-foreground sm:text-lg">
              Умный помощник, который знает всё о комплектациях дилеров Алматы
            </p>

            <SearchBar onSearch={handleSearch} isLoading={isLoading} />

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestionTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="mx-auto max-w-7xl px-4 py-6"
          >
            <div className="mb-6 flex justify-center">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} compact />
            </div>

            {/* Desktop: 40/60 split, Mobile: stacked with collapsible chat */}
            <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
              <div className="min-h-0 md:min-h-[400px]">
                <AIChatPanel query={searchQuery} />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {mockCars.map((car, i) => (
                  <CarCard key={car.id} car={car} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
