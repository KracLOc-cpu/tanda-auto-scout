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
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const queryClient = new QueryClient();

const Header = () => {
  const { selectedCars } = useComparison();
  const { profile, loading, signOut } = useAuth();
  const [showComparison, setShowComparison] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasShownTooltip, setHasShownTooltip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Показываем тултип когда добавлена 2-я машина (уже есть смысл сравнивать)
  useEffect(() => {
    if (selectedCars.length === 2 && !hasShownTooltip) {
      setShowTooltip(true);
      setHasShownTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [selectedCars.length, hasShownTooltip]);

  const handleCompareClick = useCallback(() => {
    setShowTooltip(false);
    setShowComparison(true);
  }, []);

  const handleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md transition-colors duration-300 sm:px-6">
        <span className="text-xl font-bold text-primary">TANDA.kz</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">Алматы</span>
          <DarkModeToggle />

          {/* Кнопка сравнения */}
          <div className="relative">
            <button
              onClick={handleCompareClick}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCars.length > 0
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <span className="hidden sm:inline">Сравнить</span>
              <span className="sm:hidden">⚖️</span>
              {selectedCars.length > 0 && (
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  selectedCars.length > 0 ? "bg-white/30" : "bg-foreground/20"
                }`}>
                  {selectedCars.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 z-[100] w-56 rounded-lg border border-primary/30 bg-popover p-3 text-sm text-popover-foreground shadow-lg"
                >
                  <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-primary/30 bg-popover" />
                  <p className="font-medium text-primary">💡 Можно сравнить!</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Нажмите чтобы открыть таблицу сравнения</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth section */}
          {!loading && (
            profile ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-2 py-1 transition-colors hover:bg-secondary"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                    <AvatarFallback className="text-xs">{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground sm:inline">
                    {profile.name.split(" ")[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 z-[100] w-48 rounded-lg border border-border bg-popover p-2 shadow-lg"
                    >
                      <p className="px-2 py-1 text-sm font-medium text-foreground">{profile.name}</p>
                      <p className="px-2 pb-2 text-xs text-muted-foreground">{profile.email}</p>
                      <button
                        onClick={() => { setShowUserMenu(false); signOut(); }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Выйти
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Войти
              </button>
            )
          )}
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
