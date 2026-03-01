export interface Car {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceNum: number;
  image: string;
  badge?: string;
  engine: string;
  transmission: string;
  drive: string;
}

export const mockCars: Car[] = [
  {
    id: "1",
    name: "Tucson",
    brand: "Hyundai",
    price: "14 990 000 ₸",
    priceNum: 14990000,
    image: "https://images.unsplash.com/photo-1633854820166-200e1e07c5b9?w=600&h=400&fit=crop",
    badge: "Высокая ликвидность",
    engine: "2.0 MPI 150 л.с.",
    transmission: "6AT",
    drive: "Передний",
  },
  {
    id: "2",
    name: "Tiggo 7 Pro",
    brand: "Chery",
    price: "11 490 000 ₸",
    priceNum: 11490000,
    image: "https://images.unsplash.com/photo-1568844293986-8d0400f4f1b5?w=600&h=400&fit=crop",
    badge: "Лучшая цена",
    engine: "1.5T 147 л.с.",
    transmission: "CVT",
    drive: "Передний",
  },
  {
    id: "3",
    name: "Sportage",
    brand: "Kia",
    price: "15 490 000 ₸",
    priceNum: 15490000,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop",
    engine: "2.0 MPI 150 л.с.",
    transmission: "6AT",
    drive: "Полный",
  },
];

export const mockChatMessages = [
  {
    role: "assistant" as const,
    text: "Привет! Я проанализировал базы Hyundai, Chery и Kia. Вот 3 модели, которые идеально подходят под ваш запрос:",
  },
  {
    role: "assistant" as const,
    text: "🔹 **Hyundai Tucson** — самая ликвидная модель, отличная остаточная стоимость.\n🔹 **Chery Tiggo 7 Pro** — лучшее соотношение цена/оснащение.\n🔹 **Kia Sportage** — доступен с полным приводом, надёжный автомат.",
  },
];

export const mockPriceData = [
  { month: "Мар 24", tucson: 12.5, tiggo: 10.2, sportage: 13.8 },
  { month: "Июн 24", tucson: 12.8, tiggo: 10.5, sportage: 14.1 },
  { month: "Сен 24", tucson: 13.2, tiggo: 10.8, sportage: 14.5 },
  { month: "Дек 24", tucson: 13.5, tiggo: 11.0, sportage: 14.8 },
  { month: "Мар 25", tucson: 12.9, tiggo: 10.9, sportage: 14.3 },
  { month: "Июн 25", tucson: 13.8, tiggo: 11.2, sportage: 14.9 },
  { month: "Сен 25", tucson: 14.2, tiggo: 11.3, sportage: 15.1 },
  { month: "Дек 25", tucson: 14.5, tiggo: 11.4, sportage: 15.3 },
  { month: "Мар 26", tucson: 14.9, tiggo: 11.5, sportage: 15.5 },
];

// Predicted data (+2% trend from last real point)
export const mockPricePredicted = [
  { month: "Мар 26", tucson: 14.9, tiggo: 11.5, sportage: 15.5 },
  { month: "Июн 26", tucson: 15.2, tiggo: 11.7, sportage: 15.8 },
  { month: "Сен 26", tucson: 15.5, tiggo: 11.9, sportage: 16.1 },
];

export const suggestionTags = [
  "Кроссоверы до 12 млн",
  "Китайцы vs Корейцы",
  "Без робота и вариатора",
];

export const dealerLocations = [
  { name: "Hyundai Premium Almaty", address: "пр. Суюнбая 155", distance: "5.2 км", brand: "Hyundai" },
  { name: "Chery Center Almaty", address: "Кульджинский тракт 8/4", distance: "7.8 км", brand: "Chery" },
  { name: "KIA Motors Almaty", address: "пр. Рыскулова 57", distance: "4.1 км", brand: "Kia" },
  { name: "Hyundai City Almaty", address: "ул. Толе Би 286", distance: "3.5 км", brand: "Hyundai" },
];

export const comparisonExtras: Record<string, Record<string, string>> = {
  "1": { winterPackage: "Да", ventilation: "Да", camera360: "Да", heatedSteeringWheel: "Да" },
  "2": { winterPackage: "Нет", ventilation: "Нет", camera360: "Нет", heatedSteeringWheel: "Да" },
  "3": { winterPackage: "Да", ventilation: "Нет", camera360: "Да", heatedSteeringWheel: "Да" },
};
