import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { Upload, Trash2, Loader2, ImagePlus, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BUCKET = "car-images";
// URL захардкожен здесь — не зависит от экспорта externalClient
const SUPABASE_URL = "https://gefiyoyjfosvrvxybmhg.supabase.co";
const STORAGE_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

const getPublicUrl = (path: string) => `${STORAGE_PREFIX}${path}`;
const isStorageUrl = (url: string) => url.includes(SUPABASE_URL + "/storage");

type Car = {
  id: number;
  brand: string;
  model: string;
  images: string[] | null;
  image_url: string | null;
};

export default function AdminPhotos() {
  const qc = useQueryClient();
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("cars")
        .select("id, brand, model, images, image_url")
        .order("brand");
      if (error) throw error;
      return data as Car[];
    },
  });

  const selectedCar = cars.find((c) => c.id === selectedCarId) ?? null;
  const storageImages: string[] = (selectedCar?.images ?? []).filter(isStorageUrl);
  const externalPreview =
    selectedCar?.image_url && !isStorageUrl(selectedCar.image_url)
      ? selectedCar.image_url
      : null;

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedCarId || !selectedCar) return;

    setUploading(true);
    const newUrls: string[] = [];
    const errors: string[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      setProgress(`Загружаю ${i + 1} из ${total}: ${file.name}`);

      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: больше 10 МБ`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${selectedCarId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      console.log("Uploading to path:", path);

      const { data: uploadData, error: uploadError } = await externalSupabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        errors.push(`${file.name}: ${uploadError.message}`);
      } else {
        console.log("Uploaded successfully:", uploadData);
        newUrls.push(getPublicUrl(path));
      }
    }

    setProgress("");

    if (newUrls.length > 0) {
      const existing = (selectedCar.images ?? []).filter(isStorageUrl);
      const merged = [...existing, ...newUrls];

      console.log("Saving images array:", merged);

      const { error: updateError } = await externalSupabase
        .from("cars")
        .update({ images: merged, image_url: merged[0] })
        .eq("id", selectedCarId);

      if (updateError) {
        console.error("DB update error:", updateError);
        showToast(`Ошибка сохранения в БД: ${updateError.message}`, "err");
      } else {
        await qc.invalidateQueries({ queryKey: ["admin-cars"] });
        await qc.invalidateQueries({ queryKey: ["cars"] });
        showToast(`✅ Загружено ${newUrls.length} из ${total} фото`, "ok");
      }
    } else if (errors.length > 0) {
      showToast(`❌ Ошибки загрузки: ${errors.join(" | ")}`, "err");
    }

    if (errors.length > 0 && newUrls.length > 0) {
      showToast(`⚠️ ${newUrls.length} загружено, ${errors.length} ошибок: ${errors[0]}`, "err");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
  };

  const handleDelete = async (url: string) => {
    if (!selectedCarId || !selectedCar) return;

    if (isStorageUrl(url)) {
      const path = url.replace(STORAGE_PREFIX, "");
      const { error } = await externalSupabase.storage.from(BUCKET).remove([path]);
      if (error) console.error("Storage delete error:", error);
    }

    const updated = (selectedCar.images ?? []).filter(isStorageUrl).filter((u) => u !== url);
    const nextMain = updated[0] ?? selectedCar.image_url ?? null;

    await externalSupabase
      .from("cars")
      .update({ images: updated, image_url: nextMain })
      .eq("id", selectedCarId);

    await qc.invalidateQueries({ queryKey: ["admin-cars"] });
    await qc.invalidateQueries({ queryKey: ["cars"] });
    showToast("🗑️ Фото удалено", "ok");
  };

  const totalPhotos = (car: Car) => (car.images ?? []).filter(isStorageUrl).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg max-w-sm ${
              toast.type === "err"
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-card border-border text-foreground"
            }`}
          >
            {toast.type === "err"
              ? <AlertCircle className="h-4 w-4 shrink-0" />
              : <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-2xl font-bold text-foreground">📸 Управление фото</h1>
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
                const count = totalPhotos(car);
                const active = selectedCarId === car.id;
                return (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCarId(car.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-medium opacity-70">{car.brand}</p>
                      <p className="text-sm font-semibold">{car.model}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      active ? "bg-white/20 text-white"
                      : count > 0 ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                    }`}>
                      {count > 0 ? `${count} фото` : "нет фото"}
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
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    {uploading ? "Загружаю..." : "Добавить фото"}
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

                {/* Drag-and-drop */}
                <div
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                    uploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-primary">{progress || "Загружаю..."}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Перетащи фото сюда или нажми{" "}
                        <span className="font-medium text-primary">«Добавить фото»</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP · до 10 МБ · можно несколько сразу</p>
                    </>
                  )}
                </div>

                {/* Внешнее превью */}
                {externalPreview && storageImages.length === 0 && (
                  <div className="rounded-xl border border-border bg-secondary/30 p-3">
                    <p className="mb-2 text-xs text-muted-foreground">
                      ℹ️ Сейчас используется фото от дилера. Загрузи своё — оно заменит его.
                    </p>
                    <img
                      src={externalPreview}
                      alt="текущее фото"
                      className="h-24 w-auto rounded-lg object-cover opacity-60"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}

                {/* Сетка загруженных фото */}
                {storageImages.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Загруженные фото ({storageImages.length})
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {storageImages.map((url, idx) => (
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
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://placehold.co/400x300/1a1a2e/4a9eff?text=Ошибка";
                            }}
                          />
                          <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                            {idx + 1}
                          </span>
                          <button
                            onClick={() => handleDelete(url)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] text-white">
                              <CheckCircle2 className="h-3 w-3" /> Главное
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      💡 Первое фото — главное в карточке. Наведи чтобы удалить.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
