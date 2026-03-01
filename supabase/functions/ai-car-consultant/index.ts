import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Car {
  id: string;
  name: string;
  brand: string;
  price: string;
  price_num: number;
  engine: string;
  transmission: string;
  drive: string;
  badge: string | null;
  specifications: Record<string, string> | null;
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: cars, error } = await supabase
      .from("cars")
      .select("id, name, brand, price, price_num, engine, transmission, drive, badge, specifications")
      .order("price_num", { ascending: true });

    if (error) throw error;

    const carsContext = (cars as Car[])
      .map(
        (c) =>
          `- ${c.brand} ${c.name} [ID: ${c.id}]: цена ${c.price} (${c.price_num} тг), двигатель ${c.engine}, КПП ${c.transmission}, привод ${c.drive}${c.badge ? `, бэйдж: ${c.badge}` : ""}${c.specifications ? `, спецификации: ${JSON.stringify(c.specifications)}` : ""}`
      )
      .join("\n");

    const carIds = (cars as Car[]).map((c) => ({ id: c.id, label: `${c.brand} ${c.name}` }));

    const currentFiltersJson = currentFilters ? JSON.stringify(currentFilters) : "нет";

    // Extract unique brands from DB for smart grouping
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

ГРУППИРОВКА БРЕНДОВ ПО СТРАНЕ (используй для запросов типа "китайские авто", "корейцы" и т.д.):
- Китайские бренды в наличии: ${chineseBrands.length > 0 ? chineseBrands.join(", ") : "нет"}
- Корейские бренды в наличии: ${koreanBrands.length > 0 ? koreanBrands.join(", ") : "нет"}
- Японские бренды в наличии: ${japaneseBrands.length > 0 ? japaneseBrands.join(", ") : "нет"}
- Немецкие бренды в наличии: ${germanBrands.length > 0 ? germanBrands.join(", ") : "нет"}

ТЕКУЩИЕ ФИЛЬТРЫ КЛИЕНТА (накопленные из предыдущих сообщений):
${currentFiltersJson}

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе автомобилей выше. Не выдумывай модели. Показывай ВСЕ подходящие, а не 1-2.
2. Говори о ликвидности (остаточная стоимость) в Казахстане.
3. Упоминай сервисные центры в Алматы при необходимости.
4. Если спрашивают про горы/бездорожье — рекомендуй полный привод (4WD).
5. Если спрашивают про экономию — сортируй по цене.
6. Будь кратким, дружелюбным, профессиональным.
7. Используй эмодзи для структуры (🔹, ✅, 💰).
${userName ? `8. Обращайся к клиенту по имени: ${userName}.` : ""}

ЗАПРОСЫ ПО СТРАНЕ ПРОИСХОЖДЕНИЯ:
- Когда клиент просит "китайские авто", "китайцы" — поставь в brands ВСЕ китайские бренды из списка выше: [${chineseBrands.map(b => `"${b}"`).join(", ")}]
- Когда клиент просит "корейские авто", "корейцы" — поставь brands: [${koreanBrands.map(b => `"${b}"`).join(", ")}]
- Когда клиент просит "японские авто", "японцы" — поставь brands: [${japaneseBrands.map(b => `"${b}"`).join(", ")}]
- Когда клиент просит "немецкие авто" — поставь brands: [${germanBrands.map(b => `"${b}"`).join(", ")}]
- ВАЖНО: Включай ВСЕ подходящие бренды, не ограничивайся 1-2.

ПОИСК ПО СПЕЦИФИКАЦИЯМ:
- Панорамная крыша: ищи в specifications ключи содержащие "панорам", "panoram", "люк", "sunroof" (регистронезависимо).
- Вентиляция: ищи "ventilation", "вентиляц".
- Камера 360: ищи "camera360", "камера", "360".
- При поиске по спецификациям выводи ВСЕ автомобили у которых данная спецификация = "Да" или содержит нужное значение.

НАКОПИТЕЛЬНАЯ ФИЛЬТРАЦИЯ:
- Клиент задаёт критерии постепенно. Ты должен ОБНОВЛЯТЬ фильтры, а не заменять целиком.
- Пример: если клиент сказал "до 11 млн", а потом "клиренс от 210мм" — оба условия должны быть активны.
- Если клиент говорит "измени цену на 15 млн" — обнови только price_max, остальные фильтры сохрани.
- Если клиент просит КОНКРЕТНЫЕ бренды (Kia, Hyundai), НЕ показывай другие бренды, если только не предупредишь "также рассмотрите альтернативы".

СТРОГОЕ СООТВЕТСТВИЕ БРЕНДОВ:
- Если клиент явно указал бренды — фильтруй ТОЛЬКО по ним.
- Показывай авто других брендов ТОЛЬКО если явно скажешь "в качестве альтернативы предлагаю также посмотреть".

ВАЖНО: В конце ответа добавь ОБЯЗАТЕЛЬНО две строки:

1. [RECOMMEND_IDS: id1, id2]
где id1, id2 — UUID автомобилей из списка выше, которые ты рекомендуешь. Если не рекомендуешь — не добавляй.

2. [FILTERS: {"price_max": число|null, "price_min": число|null, "brands": ["бренд1"]|null, "drive": "строка"|null, "transmission": "строка"|null, "clearance_min": число|null, "engine_type": "строка"|null}]
Это ОБНОВЛЁННЫЕ фильтры (объединение текущих + новые из сообщения клиента). Если клиент не менял фильтр — оставь прежнее значение. Если убирает ограничение — поставь null.

ЕСЛИ НИ ОДИН АВТОМОБИЛЬ НЕ ПОДХОДИТ ПОД ВСЕ ФИЛЬТРЫ:
- Укажи это в тексте: "По вашим критериям (X + Y) точных совпадений нет."
- Предложи ближайшие варианты.
- Добавь строку: [NO_EXACT_MATCH: true]

АПСЕЙЛ (UPSELL) ЛОГИКА:
- Когда клиент задаёт бюджет (price_max), ты ОБЯЗАН также посмотреть на авто до +10% сверх лимита.
- Если есть авто в пределах бюджета И авто чуть выше — покажи сначала те что в бюджете.
- Затем скажи: "Но если добавить всего X тг, в выборку попадёт ещё и [Бренд Модель] с [ключевое преимущество]".
- Добавь строку: [UPSELL: {"new_price_max": число, "car_names": ["Бренд Модель"], "extra_amount": число}]
  где new_price_max = price_max * 1.1 (округлённое), car_names = авто которые попадают в диапазон (price_max, new_price_max], extra_amount = разница.
- Если авто выше бюджета НЕТ — не добавляй строку [UPSELL].
- UPSELL строка нужна ТОЛЬКО когда есть price_max фильтр.

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
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let text = aiData.choices?.[0]?.message?.content || "Извините, не удалось получить ответ.";

    // Extract recommended car IDs
    const recommendMatch = text.match(/\[RECOMMEND_IDS:\s*([^\]]+)\]/);
    let recommendedIds: string[] = [];
    if (recommendMatch) {
      recommendedIds = recommendMatch[1].split(",").map((s: string) => s.trim()).filter(Boolean);
      text = text.replace(/\[RECOMMEND_IDS:[^\]]+\]/, "").trim();
    }

    // Extract filters — handle nested JSON with arrays
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

    // Extract no exact match flag
    const noMatchFlag = text.match(/\[NO_EXACT_MATCH:\s*true\]/);
    const noExactMatch = !!noMatchFlag;
    if (noMatchFlag) {
      text = text.replace(/\[NO_EXACT_MATCH:\s*true\]/, "").trim();
    }

    // Extract upsell data — handle nested arrays
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
      JSON.stringify({ text, recommendedIds, filters, noExactMatch, upsell }),
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
