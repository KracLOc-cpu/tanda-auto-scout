import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const EXTERNAL_SUPABASE_URL = "https://gefiyoyjfosvrvxybmhg.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZml5b3lqZm9zdnJ2eHlibWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzg0OTIsImV4cCI6MjA4NzkxNDQ5Mn0.a6TJuHQK40DQJ9XtjMXTDST_LLZtjSAKXNi64IVwcOc";

interface Car {
  id: number;
  brand: string;
  model: string;
  price: number;
  year: number;
  image_url: string;
  description: string | null;
  is_available: boolean;
  city: string | null;
  specifications: Record<string, unknown> | null;
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
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;

    console.log(`Fetched ${(cars as Car[]).length} cars from external DB`);

    const carsContext = (cars as Car[])
      .map((c) => {
        const specs = c.specifications as Record<string, unknown> || {};
        const drive = specs.drive || "N/A";
        const engine = specs.engine || "N/A";
        const transmission = specs.transmission || "N/A";
        const power = specs.power || "";
        const features = Array.isArray(specs.features) ? specs.features.join(", ") : "";
        return `- ${c.brand} ${c.model} ${c.year} [ID: ${c.id}]: цена ${c.price.toLocaleString("ru-RU")} тг, двигатель ${engine} ${power}, КПП ${transmission}, привод ${drive}${features ? `, опции: ${features}` : ""}${c.description ? `, описание: ${c.description.substring(0, 100)}` : ""}`;
      })
      .join("\n");

    const carIds = (cars as Car[]).map((c) => ({ id: c.id, label: `${c.brand} ${c.model}` }));

    const currentFiltersJson = currentFilters ? JSON.stringify(currentFilters) : "нет";

    const allBrands = [...new Set((cars as Car[]).map(c => c.brand))];
    const chineseBrands = allBrands.filter(b =>
      ["Chery", "Haval", "Geely", "Lixiang", "Zeekr", "BYD", "Changan", "Jetour", "Exeed", "GAC", "FAW", "Dongfeng", "Tank", "Omoda", "Jaecoo"].includes(b)
    );
    const koreanBrands = allBrands.filter(b => ["Hyundai", "Kia", "Genesis", "SsangYong"].includes(b));
    const japaneseBrands = allBrands.filter(b => ["Toyota", "Honda", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Suzuki", "Lexus"].includes(b));
    const germanBrands = allBrands.filter(b => ["BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Porsche"].includes(b));

    const systemPrompt = `Ты — профессиональный автоконсультант TANDA в Алматы, Казахстан. Ты помогаешь клиентам выбрать автомобиль.

ТЕКУЩИЕ АВТОМОБИЛИ В НАЛИЧИИ (всего ${(cars as Car[]).length} авто):
${carsContext}

ГРУППИРОВКА БРЕНДОВ ПО СТРАНЕ:
- Китайские: ${chineseBrands.length > 0 ? chineseBrands.join(", ") : "нет"}
- Корейские: ${koreanBrands.length > 0 ? koreanBrands.join(", ") : "нет"}
- Японские: ${japaneseBrands.length > 0 ? japaneseBrands.join(", ") : "нет"}
- Немецкие: ${germanBrands.length > 0 ? germanBrands.join(", ") : "нет"}

ТЕКУЩИЕ ФИЛЬТРЫ КЛИЕНТА:
${currentFiltersJson}

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе автомобилей выше. Не выдумывай модели. Показывай ВСЕ подходящие.
2. Говори о ликвидности в Казахстане.
3. Будь кратким, дружелюбным, профессиональным.
4. Используй эмодзи для структуры (🔹, ✅, 💰).
${userName ? `5. Обращайся к клиенту по имени: ${userName}.` : ""}

ЗАПРОСЫ ПО СТРАНЕ:
- "китайские авто" → brands: [${chineseBrands.map(b => `"${b}"`).join(", ")}]
- "корейские авто" → brands: [${koreanBrands.map(b => `"${b}"`).join(", ")}]
- "японские авто" → brands: [${japaneseBrands.map(b => `"${b}"`).join(", ")}]
- "немецкие авто" → brands: [${germanBrands.map(b => `"${b}"`).join(", ")}]

НАКОПИТЕЛЬНАЯ ФИЛЬТРАЦИЯ:
- Обновляй фильтры, не заменяй целиком.
- Если клиент явно указал бренды — фильтруй ТОЛЬКО по ним.

ПОИСК ПО СПЕЦИФИКАЦИЯМ:
- Данные в поле specifications (JSON): drive, engine, transmission, power, features (массив), fuel_consumption, liquidity_score.
- Панорамная крыша: ищи в features "панорам", "panoram", "люк", "sunroof".
- Камера 360: ищи в features "360", "камера".

ВАЖНО: В конце ответа добавь ОБЯЗАТЕЛЬНО:

1. [RECOMMEND_IDS: id1, id2]

2. [FILTERS: {"price_max": число|null, "price_min": число|null, "brands": ["бренд1"]|null, "drive": "строка"|null, "transmission": "строка"|null, "clearance_min": число|null, "engine_type": "строка"|null}]

ЕСЛИ НИ ОДИН АВТОМОБИЛЬ НЕ ПОДХОДИТ:
- [NO_EXACT_MATCH: true]

АПСЕЙЛ: Если есть price_max, посмотри авто до +10% сверх лимита.
- Если есть — скажи "если добавить X тг, появится ещё Y".
- [UPSELL: {"new_price_max": число, "car_names": ["Бренд Модель"], "extra_amount": число}]

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
      try {
        filters = JSON.parse(filtersMatch[1]);
      } catch (e) {
        console.error("Failed to parse filters:", filtersMatch[1], e);
      }
      text = text.replace(/\[FILTERS:\s*\{[\s\S]*?\}\s*\]/, "").trim();
    }

    const noMatchFlag = text.match(/\[NO_EXACT_MATCH:\s*true\]/);
    const noExactMatch = !!noMatchFlag;
    if (noMatchFlag) {
      text = text.replace(/\[NO_EXACT_MATCH:\s*true\]/, "").trim();
    }

    const upsellMatch = text.match(/\[UPSELL:\s*(\{[\s\S]*?\})\s*\]/);
    let upsell = null;
    if (upsellMatch) {
      try {
        upsell = JSON.parse(upsellMatch[1]);
      } catch (e) {
        console.error("Failed to parse upsell:", e);
      }
      text = text.replace(/\[UPSELL:\s*\{[\s\S]*?\}\s*\]/, "").trim();
    }

    return new Response(
      JSON.stringify({ text, recommendedIds, filters, noExactMatch, upsell, totalCars: (cars as Car[]).length }),
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
