// Car type is now in src/hooks/useCars.ts (CarDB)

export const mockChatMessages = [
  {
    role: "assistant" as const,
    text: "Привет! Я проанализировал базы Hyundai, Chery и Kia. Вот 3 модели, которые идеально подходят под ваш запрос:",
  },
  {
    role: "assistant" as const,
    text: "🔹 **Hyundai Tucson** — самая ликвидная модель, отличная остаточная стоимость.\n🔹 **Chery Tiggo 4** — лучшее соотношение цена/оснащение.\n🔹 **Kia Sportage** — доступен с полным приводом, надёжный автомат.",
  },
];

export const mockFollowUpResponses: Record<string, string> = {
  "кредит":
    "По кредиту для выбранных авто:\n\n🔹 **Hyundai Tucson** — от 89 000 ₸/мес (7 лет, 20% взнос)\n🔹 **Chery Tiggo 4** — от 68 000 ₸/мес (7 лет, 20% взнос)\n🔹 **Kia Sportage** — от 92 000 ₸/мес (7 лет, 20% взнос)\n\nЛучшие ставки сейчас у Halyk Bank — от 18.9% годовых.",
  "страховка":
    "Стоимость КАСКО на первый год:\n\n🔹 Tucson — ~520 000 ₸\n🔹 Tiggo 4 — ~380 000 ₸\n🔹 Sportage — ~540 000 ₸\n\nРекомендую Freedom Finance Insurance — у них скидка 15% при онлайн-оформлении.",
  "default":
    "Хороший вопрос! На основе выбранных моделей могу сказать следующее:\n\nВсе три автомобиля — отличный выбор в своём сегменте. Если нужно больше деталей по конкретному параметру, уточните — я помогу!",
};

export const mockPriceData = [
  { month: "Мар 24", tucson: 12.5, sportage: 13.8, tiggo4: 7.8 },
  { month: "Июн 24", tucson: 12.8, sportage: 14.1, tiggo4: 8.0 },
  { month: "Сен 24", tucson: 13.2, sportage: 14.5, tiggo4: 8.2 },
  { month: "Дек 24", tucson: 13.5, sportage: 14.8, tiggo4: 8.4 },
  { month: "Мар 25", tucson: 12.9, sportage: 14.3, tiggo4: 8.3 },
  { month: "Июн 25", tucson: 13.8, sportage: 14.9, tiggo4: 8.5 },
  { month: "Сен 25", tucson: 14.2, sportage: 15.1, tiggo4: 8.8 },
  { month: "Дек 25", tucson: 14.5, sportage: 15.3, tiggo4: 9.0 },
  { month: "Мар 26", tucson: 14.9, sportage: 15.5, tiggo4: 9.2 },
];

export const mockPricePredicted = [
  { month: "Мар 26", tucson: 14.9, sportage: 15.5, tiggo4: 9.2 },
  { month: "Июн 26", tucson: 15.2, sportage: 15.8, tiggo4: 9.4 },
  { month: "Сен 26", tucson: 15.5, sportage: 16.1, tiggo4: 9.6 },
];

export const suggestionTags = [
  "Кроссоверы до 12 млн",
  "Китайцы vs Корейцы",
  "Авто с большим клиренсом",
  "Седаны до 10 млн",
];

export const dealerLocations = [
  { name: "Hyundai Premium Almaty", address: "пр. Суюнбая 155", distance: "5.2 км", brand: "Hyundai" },
  { name: "Chery Center Almaty", address: "Кульджинский тракт 8/4", distance: "7.8 км", brand: "Chery" },
  { name: "KIA Motors Almaty", address: "пр. Рыскулова 57", distance: "4.1 км", brand: "Kia" },
  { name: "JAC Almaty", address: "пр. Райымбека 212", distance: "6.3 км", brand: "JAC" },
];
