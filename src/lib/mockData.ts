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
  { month: "Янв 24", tucson: 14.2, tiggo: 10.8, sportage: 14.9 },
  { month: "Апр 24", tucson: 14.5, tiggo: 11.0, sportage: 15.1 },
  { month: "Июл 24", tucson: 14.3, tiggo: 11.2, sportage: 15.0 },
  { month: "Окт 24", tucson: 14.8, tiggo: 11.3, sportage: 15.2 },
  { month: "Янв 25", tucson: 14.7, tiggo: 11.4, sportage: 15.3 },
  { month: "Апр 25", tucson: 14.9, tiggo: 11.5, sportage: 15.4 },
  { month: "Июл 25", tucson: 15.0, tiggo: 11.5, sportage: 15.5 },
  { month: "Окт 25", tucson: 15.1, tiggo: 11.6, sportage: 15.6 },
  { month: "Янв 26", tucson: 15.0, tiggo: 11.5, sportage: 15.5 },
];

export const suggestionTags = [
  "Кроссоверы до 12 млн",
  "Китайцы vs Корейцы",
  "Без робота и вариатора",
];
