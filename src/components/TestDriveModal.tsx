import { useState } from "react";
import { X, Car, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestDriveModalProps {
  open: boolean;
  onClose: () => void;
  carName: string;
}

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
  return digits.length === 11 && digits.startsWith("77");
};

const TestDriveModal = ({ open, onClose, carName }: TestDriveModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length === 0) {
      setPhone("");
      return;
    }
    let digits = raw;
    if (!digits.startsWith("7")) digits = "7" + digits;
    setPhone(formatPhone(digits));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = "Введите имя (мин. 2 символа)";
    if (!isValidKZPhone(phone)) newErrors.phone = "Формат: +7 (7xx) xxx-xx-xx";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setSubmitted(false);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
          >
            <button onClick={handleClose} className="absolute right-3 top-3 rounded-full p-1 hover:bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Заявка отправлена!</h3>
                <p className="text-sm text-muted-foreground">
                  Менеджер свяжется с вами в течение 30 минут для подтверждения тест-драйва {carName}.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Закрыть
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Тест-драйв</h3>
                    <p className="text-sm text-muted-foreground">{carName}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Имя</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ваше имя"
                      maxLength={100}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Телефон</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (7xx) xxx-xx-xx"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Отправить заявку
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TestDriveModal;
