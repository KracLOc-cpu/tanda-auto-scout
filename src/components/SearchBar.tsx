import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  compact?: boolean;
}

const SearchBar = ({ onSearch, isLoading, compact }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      layout
      className={`relative w-full ${compact ? "max-w-2xl" : "max-w-3xl"}`}
    >
      <div
        className={`flex items-center rounded-full border border-border bg-card shadow-sm transition-all duration-300 focus-within:shadow-[0_0_20px_hsl(var(--primary)/0.25)] focus-within:border-primary ${
          compact ? "px-4 py-2" : "px-6 py-3"
        }`}
      >
        <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Опишите, какое авто ищете..."
          className={`flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground ${
            compact ? "text-sm" : "text-base"
          }`}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="ml-3 shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Найти"
          )}
        </button>
      </div>
    </motion.form>
  );
};

export default SearchBar;
