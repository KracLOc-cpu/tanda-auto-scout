import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { externalSupabase } from "@/integrations/supabase/externalClient";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setError("");
    setLoading(false);
    onClose();
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const { error } = await externalSupabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError("Ошибка входа. Попробуйте ещё раз.");
      setLoading(false);
    }
    // При успехе — браузер редиректит на Google
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">🚗</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Войти в TANDA</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Сохраняйте избранные авто и отслеживайте цены
              </p>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-3.5 text-sm font-medium text-foreground transition-all hover:bg-secondary hover:shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Перенаправление..." : "Войти через Google"}
            </button>

            {error && (
              <p className="mt-3 text-center text-xs text-destructive">{error}</p>
            )}

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Входя в аккаунт, вы соглашаетесь с условиями использования
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
