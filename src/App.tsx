import { useState } from "react";
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

const queryClient = new QueryClient();

const Header = () => {
  const { selectedCars } = useComparison();
  const [showComparison, setShowComparison] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md transition-colors duration-300 sm:px-6">
        <span className="text-xl font-bold text-primary">TANDA.kz</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">Алматы</span>
          <DarkModeToggle />
          <button
            onClick={() => setShowComparison(true)}
            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Сравнить: {selectedCars.length}
          </button>
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
