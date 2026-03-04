import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { Upload, Trash2, Loader2, ImagePlus, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BUCKET = "car-images";
const SUPABASE_URL = "https://gefiyoyjfosvrvxybmhg.supabase.co";

// Публичный URL файла из Storage
const getPublicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

export default function AdminPhotos() {
  const qc = useQueryClient();
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Список машин
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("cars")
        .select("id, brand, model, images, image_url")
        .order("brand");
      if (error) throw error;
      return data as { id: number; brand: string; model: string; images: string[] | null; image_url: string | null }[];
    },
  });

  const selectedCar = cars.find((c) => c.id === selectedCarId);
  const currentImages: string[] = selectedCar?.images ?? [];

  // Загрузка фото
  const handleUpload = async (files: FileList | null) => {
    if (!files || !selectedCarId || !selectedCar) return;
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${selectedCarId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await externalSupabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (!error) newUrls.push(getPublicUrl(path));
    }

    if (newUrls.length > 0) {
      const merged = [...currentImages, ...newUrls];
      await externalSupabase.from("cars").update({ images: merged }).eq("id", selectedCarId);
      await qc.invalidateQueries({ queryKey: ["admin-cars"] });
      await qc.invalidateQueries({ queryKey: ["cars"] });
      showToast(`✅ Загружено ${newUrls.length} фото`);
    }
    setUploading(false);
  };

  // Удаление фото
  const handleDelete = async (url: string, idx: number) => {
    if (!selectedCarId || !selectedCar) return;
    // Путь в Storage
    const path = url.replace(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`, "");
    await externalSupabase.storage.from(BUCKET).remove([path]);
    const updated = currentImages.filter((_, i) => i !== idx);
    await externalSupabase.from("cars").update({ images: updated }).eq("id", selectedCarId);
    await qc.invalidateQueries({ queryKey: ["admin-cars"] });
    await qc.invalidateQueries({ queryKey: ["cars"] });
    showToast("🗑️ Фото удалено");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 rounded-xl bg-card border border-border px-4 py-3 text-sm font-medium shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-bold text-foreground">📸 Управление фото</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Выбери машину → загрузи фото → они появятся в карусели у клиентов
        </p>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Список машин */}
          <div className="space-y-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Автомобили ({cars.length})
            </p>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              cars.map((car) => {
                const photoCount = (car.images ?? []).length;
                return (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCarId(car.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      selectedCarId === car.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-medium opacity-70">{car.brand}</p>
                      <p className="text-sm font-semibold">{car.model}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      selectedCarId === car.id
                        ? "bg-white/20 text-white"
                        : photoCount > 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {photoCount > 0 ? `${photoCount} фото` : "нет фото"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Правая панель */}
          <div>
            {!selectedCar ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-border">
                <p className="text-muted-foreground">← Выбери машину слева</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{selectedCar.brand}</p>
                    <h2 className="text-lg font-bold text-foreground">{selectedCar.model}</h2>
                  </div>

                  {/* Кнопка загрузки */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    {uploading ? "Загрузка..." : "Добавить фото"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </div>

                {/* Зона drag-and-drop */}
                <div
                  className="rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
                >
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Перетащи фото сюда или нажми "Добавить фото"
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP · до 10 МБ каждое</p>
                </div>

                {/* Сетка фото */}
                {currentImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {currentImages.map((url, idx) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
                      >
                        <img
                          src={url}
                          alt={`фото ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {/* Номер */}
                        <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                          {idx + 1}
                        </span>
                        {/* Удалить */}
                        <button
                          onClick={() => handleDelete(url, idx)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {/* Первое фото = главное */}
                        {idx === 0 && (
                          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] text-white">
                            <CheckCircle2 className="h-3 w-3" /> Главное
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl bg-secondary/30 text-muted-foreground">
                    <p className="text-sm">Фото ещё не добавлены</p>
                  </div>
                )}

                {currentImages.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    💡 Первое фото — главное, оно показывается в карточке. Для смены порядка удали и загрузи снова.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
