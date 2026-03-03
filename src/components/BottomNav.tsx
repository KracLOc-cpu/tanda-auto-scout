import { useState } from "react";
import { Home, Heart, GitCompare, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useComparison } from "@/context/ComparisonContext";
import ComparisonModal from "./ComparisonModal";

interface BottomNavProps {
  onOpenChat: () => void;
  appState: string;
}

const BottomNav = ({ onOpenChat, appState }: BottomNavProps) => {
  const { selectedCars } = useComparison();
  const [showComparison, setShowComparison] = useState(false);

  if (appState === "LANDING") return null;

  return (
    <>
      <motion.nav
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-md px-2 pb-safe md:hidden"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        {/* Главная */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-center gap-0.5 px-4 py-2 text-muted-foreground"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Каталог</span>
        </button>

        {/* Сравнение */}
        <button
          onClick={() => setShowComparison(true)}
          className="relative flex flex-col items-center gap-0.5 px-4 py-2"
        >
          <div className="relative">
            <GitCompare className={`h-5 w-5 ${selectedCars.length > 0 ? "text-primary" : "text-muted-foreground"}`} />
            {selectedCars.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
              >
                {selectedCars.length}
              </motion.span>
            )}
          </div>
          <span className={`text-[10px] ${selectedCars.length > 0 ? "text-primary" : "text-muted-foreground"}`}>
            Сравнить
          </span>
        </button>

        {/* AI чат — центральная большая кнопка */}
        <button
          onClick={onOpenChat}
          className="relative -mt-4 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40"
        >
          <Bot className="h-6 w-6 text-primary-foreground" />
        </button>

        {/* Избранное — заглушка */}
        <button
          className="flex flex-col items-center gap-0.5 px-4 py-2 text-muted-foreground opacity-40"
        >
          <Heart className="h-5 w-5" />
          <span className="text-[10px]">Избранное</span>
        </button>

        {/* Пустой слот для симметрии */}
        <div className="w-16" />
      </motion.nav>

      {/* Отступ снизу чтобы контент не перекрывался */}
      <div className="h-20 md:hidden" />

      <ComparisonModal open={showComparison} onClose={() => setShowComparison(false)} />
    </>
  );
};

export default BottomNav;
