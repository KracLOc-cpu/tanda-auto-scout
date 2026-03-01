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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, userName } = await req.json();

    // Fetch all cars from DB
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: cars, error } = await supabase
      .from("cars")
      .select("id, name, brand, price, price_num, engine, transmission, drive, badge, specifications")
      .order("price_num", { ascending: true });

    if (error) throw error;

    const carsContext = (cars as Car[])
      .map(
        (c) =>
          `- ${c.brand} ${c.name}: цена ${c.price}, двигатель ${c.engine}, КПП ${c.transmission}, привод ${c.drive}${c.badge ? `, бэйдж: ${c.badge}` : ""}${c.specifications ? `, доп: ${JSON.stringify(c.specifications)}` : ""}`
      )
      .join("\n");

    const carIds = (cars as Car[]).map((c) => ({ id: c.id, label: `${c.brand} ${c.name}` }));

    const systemPrompt = `Ты — профессиональный автоконсультант TANDA в Алматы, Казахстан. Ты помогаешь клиентам выбрать автомобиль.

ТЕКУЩИЕ АВТОМОБИЛИ В НАЛИЧИИ:
${carsContext}

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе автомобилей выше. Не выдумывай модели.
2. Говори о ликвидности (остаточная стоимость) в Казахстане.
3. Упоминай сервисные центры в Алматы при необходимости.
4. Если спрашивают про горы/бездорожье — рекомендуй полный привод (4WD).
5. Если спрашивают про экономию — сортируй по цене.
6. Будь кратким, дружелюбным, профессиональным.
7. Используй эмодзи для структуры (🔹, ✅, 💰).
${userName ? `8. Обращайся к клиенту по имени: ${userName}.` : ""}

ВАЖНО: В конце ответа добавь строку в формате:
[RECOMMEND_IDS: id1, id2]
где id1, id2 — UUID автомобилей, которые ты рекомендуешь в ответе. Если не рекомендуешь конкретную модель, не добавляй эту строку.

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

    const aiResponse = await fetch("https://ai.lovable.dev/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
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

    return new Response(
      JSON.stringify({ text, recommendedIds }),
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
