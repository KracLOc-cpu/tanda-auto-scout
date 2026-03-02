import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const EXTERNAL_SUPABASE_URL = "https://gefiyoyjfosvrvxybmhg.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZml5b3lqZm9zdnJ2eHlibWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzg0OTIsImV4cCI6MjA4NzkxNDQ5Mn0.a6TJuHQK40DQJ9XtjMXTDST_LLZtjSAKXNi64IVwcOc";

interface CarTrim {
  id: number;
  trim_name: string;
  engine: string;
  transmission: string;
  drive_type: string;
  seats: number | null;
  price: number;
  promo_price: number | null;
  promo_until: string | null;
  car_year: number | null;
  features: Record<string, unknown> | null;
}

interface Car {
  id: number;
  brand: string;
  model: string;
  body_type: string | null;
  fuel_type: string | null;
  year: number | null;
  image_url: string;
  clearance_mm: number | null;
  fuel_consumption_mixed: number | null;
  pros: string | null;
  cons: string | null;
  description: string | null;
  liquidity_score: number | null;
  city: string | null;
  car_trims: CarTrim[];
}

export interface CarFilters {
  price_max?: number | null;
  price_min?: number | null;
  brands?: string[] | null;
  drive?: string | null;
  transmission?: string | null;
  clearance_min?: number | null;
  engine_type?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, userName, currentFilters } = await req.json();

    const supabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
    const { data: cars, error } = await supabase
      .from("cars")
      .select("*, car_trims(*)")
      .order("id", { ascending: true });

    if (error) throw error;

    const typedCars = cars as Car[];
    console.log(`Fetched ${typedCars.length} cars with trims`);

    const now = new Date().toISOString().split("T")[0];

    const carsContext = typedCars.map((c) => {
      const trims = c.car_trims || [];
      const trimLines = trims.map((t) => {
        const promoActive = t.promo_price && (!t.promo_until || t.promo_until >= now);
        const priceStr = promoActive
          ? `${t.promo_price!.toLocaleString("ru-RU")} тг (АКЦИЯ, обычная ${t.price.toLocaleString("ru-RU")} тг)`
          : `${t.price.toLocaleString("ru-RU")} тг`;
        const features = t.features && Array.isArray((t.features as any).list) ? (t.features as any).list.join(", ") : "";
        return `  • ${t.trim_name}: ${priceStr}, ${t.engine}, ${t.transmission}, ${t.drive_type}${t.seats ? `, ${t.seats} мест` : ""}${features ? `, опции: ${features}` : ""}`;
      }).join("\n");

      return `- ${c.brand} ${c.model} [ID: ${c.id}]${c.body_type ? ` (${c.body_type})` : ""}${c.fuel_type ? `, ${c.fuel_type}` : ""}${c.clearance_mm ? `, клиренс ${c.clearance_mm}мм` : ""}${c.fuel_consumption_mixed ? `, расход ${c.fuel_consumption_mixed}л` : ""}${c.liquidity_score ? `, ликвидность ${c.liquidity_score}/10` : ""}${c.pros ? `\n  Плюсы: ${c.pros}` : ""}${c.cons ? `\n  Минусы: ${c.cons}` : ""}\n  Комплектации:\n${trimLines}`;
    }).join("\n\n");

    const carIds = typedCars.map((c) => ({ id: c.id, label: `${c.brand} ${c.model}` }));
    // Вычисляем ближайшую машину дороже бюджета — СЕРВЕР, не AI
    let computedUpsell: { new_price_max: number; car_names: string[]; extra_amount: number } | null = null;
    if (currentFilters?.price_max) {
      const budget = currentFilters.price_max;
      const upsellOptions: { price: number; label: string }[] = [];
      for (const car of typedCars) {
        for (const trim of (car.car_trims || [])) {
          const promoActive = trim.promo_price && (!trim.promo_until || trim.promo_until >= now);
          const effectivePrice = promoActive ? trim.promo_price! : trim.price;
          if (effectivePrice > budget) {
            upsellOptions.push({ price: effectivePrice, label: `${car.brand} ${car.model} ${trim.trim_name}` });
          }
        }
      }
      if (upsellOptions.length > 0) {
        upsellOptions.sort((a, b) => a.price - b.price);
        const nearest = upsellOptions[0];
        computedUpsell = {
          new_price_max: nearest.price,
          car_names: [nearest.label],
          extra_amount: nearest.price - budget,
        };
      }
    }

        const currentFiltersJson = currentFilters ? JSON.stringify(currentFilters) : "нет";

    const allBrands = [...new Set(typedCars.map((c) => c.brand))];
    const chineseBrands = allBrands.filter((b) =>
      ["Chery", "Haval", "Geely", "Lixiang", "Zeekr", "BYD", "Changan", "Jetour", "Exeed", "GAC", "FAW", "Dongfeng", "Tank", "Omoda", "Jaecoo"].includes(b)
    );
    const koreanBrands = allBrands.filter((b) => ["Hyundai", "Kia", "Genesis", "SsangYong"].includes(b));
    const japaneseBrands = allBrands.filter((b) => ["Toyota", "Honda", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Suzuki", "Lexus"].includes(b));
    const germanBrands = allBrands.filter((b) => ["BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Porsche"].includes(b));

    const systemPrompt = `Ты — профессиональный автоконсультант TANDA в Алматы, Казахстан.

АВТОМОБИЛИ В НАЛИЧИИ (${typedCars.length} моделей, каждая с комплектациями):
${carsContext}

ГРУППИРОВКА БРЕНДОВ:
- Китайские: ${chineseBrands.join(", ") || "нет"}
- Корейские: ${koreanBrands.join(", ") || "нет"}
- Японские: ${japaneseBrands.join(", ") || "нет"}
- Немецкие: ${germanBrands.join(", ") || "нет"}

ТЕКУЩИЕ ФИЛЬТРЫ: ${currentFiltersJson}

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе данных выше. Не выдумывай.
2. При вопросе о цене — используй цены из комплектаций. Если есть promo_price — упоминай акцию.
3. При вопросе о плюсах/минусах — используй поля pros/cons.
4. Говори о ликвидности (liquidity_score).
5. Будь кратким, дружелюбным, профессиональным. Используй эмодзи.
${userName ? `6. Обращайся к клиенту: ${userName}.` : ""}

НАКОПИТЕЛЬНАЯ ФИЛЬТРАЦИЯ — обновляй, не заменяй.

ВАЖНО — в конце ответа ОБЯЗАТЕЛЬНО:
1. [RECOMMEND_IDS: id1, id2]
2. [FILTERS: {"price_max": число|null, "price_min": число|null, "brands": ["бренд"]|null, "drive": "строка"|null, "transmission": "строка"|null, "clearance_min": число|null, "engine_type": "строка"|null}]

Если ничего не подходит: [NO_EXACT_MATCH: true]


Доступные ID:
${carIds.map((c) => `${c.id} = ${c.label}`).join("\n")}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: { role: string; text: string }) => ({
        role: m.role,
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let text = aiData.choices?.[0]?.message?.content || "Извините, не удалось получить ответ.";

    const recommendMatch = text.match(/\[RECOMMEND_IDS:\s*([^\]]+)\]/);
    let recommendedIds: string[] = [];
    if (recommendMatch) {
      recommendedIds = recommendMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean);
      text = text.replace(/\[RECOMMEND_IDS:[^\]]+\]/, "").trim();
    }

    const filtersMatch = text.match(/\[FILTERS:\s*(\{[\s\S]*?\})\s*\]/);
    let filters: CarFilters | null = null;
    if (filtersMatch) {
      try { filters = JSON.parse(filtersMatch[1]); } catch (e) { console.error("Parse filters error:", e); }
      text = text.replace(/\[FILTERS:\s*\{[\s\S]*?\}\s*\]/, "").trim();
    }

    const noMatchFlag = text.match(/\[NO_EXACT_MATCH:\s*true\]/);
    const noExactMatch = !!noMatchFlag;
    if (noMatchFlag) text = text.replace(/\[NO_EXACT_MATCH:\s*true\]/, "").trim();

    // Убираем [UPSELL] если AI вдруг добавил — мы не используем его версию
    text = text.replace(/\[UPSELL:\s*\{[\s\S]*?\}\s*\]/g, "").trim();

    // Upsell от сервера: показываем только если нет машин в бюджете
    const upsell = (noExactMatch || recommendedIds.length === 0) ? computedUpsell : null;

    return new Response(
      JSON.stringify({ text, recommendedIds, filters, noExactMatch, upsell, totalCars: typedCars.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
