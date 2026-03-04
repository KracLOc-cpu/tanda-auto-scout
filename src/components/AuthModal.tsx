import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, ArrowRight, Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { externalSupabase } from "@/integrations/supabase/externalClient";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "choose" | "phone_enter" | "phone_otp" | "success";

// Форматирование казахстанского номера
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  let formatted = "+7";
  if (digits.length > 1) formatted += " (" + digits.slice(1, 4);
  if (digits.length > 4) formatted += ") " + digits.slice(4, 7);
  if (digits.length > 7) formatted += "-" + digits.slice(7, 9);
  if (digits.length > 9) formatted += "-" + digits.slice(9, 11);
  return formatted;
};

const isValidKZPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("7");
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("choose");
    setPhone("");
    setOtp("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Google OAuth
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
      setError("Ошибка входа через Google. Попробуйте ещё раз.");
      setLoading(false);
    }
    // При успехе браузер редиректит — loading останется
  };

  // Отправить OTP на телефон
  const handleSendOtp = async () => {
    if (!isValidKZPhone(phone)) {
      setError("Введите корректный казахстанский номер");
      return;
    }
    setLoading(true);
    setError("");
    const digits = phone.replace(/\D/g, "");
    const e164 = "+" + digits;
    const { error } = await externalSupabase.auth.signInWithOtp({
      phone: e164,
    });
    setLoading(false);
    if (error) {
      setError(error.message.includes("rate") 
        ? "Слишком много попыток. Подождите минуту." 
        : "Не удалось отправить SMS. Проверьте номер.");
      return;
    }
    setStep("phone_otp");
  };

  // Подтвердить OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError("Введите код из SMS");
      return;
    }
    setLoading(true);
    setError("");
    const digits = phone.replace(/\D/g, "");
    const e164 = "+" + digits;
    const { error } = await externalSupabase.auth.verifyOtp({
      phone: e164,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      setError("Неверный код. Проверьте SMS или запросите новый.");
      return;
    }
    setStep("success");
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length === 0) { setPhone(""); return; }
    let digits = raw;
    if (!digits.startsWith("7")) digits = "7" + digits;
    setPhone(formatPhone(digits));
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
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            {/* Закрыть */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Назад (только на шагах после выбора) */}
            {(step === "phone_enter" || step === "phone_otp") && (
              <button
                onClick={() => {
                  if (step === "phone_otp") setStep("phone_enter");
                  else setStep("choose");
                  setError("");
                }}
                className="absolute left-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {/* ШАГ 1 — Выбор способа */}
              {step === "choose" && (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="pt-2"
                >
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-2xl">🚗</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Войти в TANDA</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Сохраняйте избранное и отслеживайте цены
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Google */}
                    <button
                      onClick={handleGoogle}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Войти через Google
                    </button>

                    <div className="relative flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">или</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Телефон */}
                    <button
                      onClick={() => setStep("phone_enter")}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Phone className="h-4 w-4" />
                      Войти по номеру телефона
                    </button>
                  </div>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Входя в аккаунт, вы соглашаетесь с условиями использования
                  </p>
                </motion.div>
              )}

              {/* ШАГ 2 — Ввод телефона */}
              {step === "phone_enter" && (
                <motion.div
                  key="phone_enter"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="pt-2"
                >
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Номер телефона</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Отправим SMS с кодом подтверждения
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+7 (700) 000-00-00"
                        autoFocus
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-lg font-medium text-foreground tracking-wider outline-none placeholder:text-muted-foreground placeholder:font-normal placeholder:text-base placeholder:tracking-normal focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      {error && (
                        <p className="mt-2 text-center text-xs text-destructive">{error}</p>
                      )}
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={loading || !isValidKZPhone(phone)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Получить код
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ШАГ 3 — Ввод OTP */}
              {step === "phone_otp" && (
                <motion.div
                  key="phone_otp"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="pt-2"
                >
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Код из SMS</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Отправили на <span className="font-medium text-foreground">{phone}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => {
                          setError("");
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        }}
                        placeholder="------"
                        autoFocus
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-3xl font-bold text-foreground tracking-[0.5em] outline-none placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      {error && (
                        <p className="mt-2 text-center text-xs text-destructive">{error}</p>
                      )}
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length < 4}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Подтвердить"
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setOtp("");
                        setError("");
                        handleSendOtp();
                      }}
                      className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Отправить код повторно
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ШАГ 4 — Успех */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15"
                  >
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-bold text-foreground">Вы вошли!</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Добро пожаловать в TANDA</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
