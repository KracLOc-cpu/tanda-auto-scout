import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DarkModeToggle from "./components/DarkModeToggle";
import ComparisonModal from "./components/ComparisonModal";
import { ComparisonProvider, useComparison } from "./context/ComparisonContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

const queryClient = new QueryClient();

const Header = () => {
  const { selectedCars } = useComparison();
  const [showComparison, setShowComparison] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasShownTooltip, setHasShownTooltip] = useState(false);

  // Listen for the first comparison add to show tooltip
  useEffect(() => {
    if (selectedCars.length === 1 && !hasShownTooltip) {
      setShowTooltip(true);
      setHasShownTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedCars.length, hasShownTooltip]);

  const handleCompareClick = useCallback(() => {
    setShowTooltip(false);
    setShowComparison(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md transition-colors duration-300 sm:px-6">
        <span className="text-xl font-bold text-primary">TANDA.kz</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">Алматы</span>
          <DarkModeToggle />
          <div className="relative">
            <button
              onClick={handleCompareClick}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Сравнить: {selectedCars.length}
            </button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 z-[100] w-64 rounded-lg border border-primary/30 bg-popover p-3 text-sm text-popover-foreground shadow-lg"
                >
                  <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-primary/30 bg-popover" />
                  <p className="font-medium text-primary">💡 Нажмите здесь, чтобы открыть таблицу сравнения</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      <ComparisonModal open={showComparison} onClose={() => setShowComparison(false)} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <ComparisonProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ComparisonProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
