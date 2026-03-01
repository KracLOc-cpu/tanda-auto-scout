
CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price TEXT NOT NULL,
  price_num NUMERIC NOT NULL,
  image TEXT NOT NULL,
  badge TEXT,
  engine TEXT NOT NULL,
  transmission TEXT NOT NULL,
  drive TEXT NOT NULL,
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public read access (car catalog is public)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cars are publicly readable"
  ON public.cars FOR SELECT
  USING (true);

-- Seed data
INSERT INTO public.cars (name, brand, price, price_num, image, badge, engine, transmission, drive, specifications) VALUES
  ('Tucson', 'Hyundai', '14 990 000 ₸', 14990000, 'https://images.unsplash.com/photo-1633854820166-200e1e07c5b9?w=600&h=400&fit=crop', 'Высокая ликвидность', '2.0 MPI 150 л.с.', '6AT', 'Передний', '{"winterPackage": "Да", "ventilation": "Да", "camera360": "Да", "heatedSteeringWheel": "Да"}'::jsonb),
  ('Tiggo 7 Pro', 'Chery', '11 490 000 ₸', 11490000, 'https://images.unsplash.com/photo-1568844293986-8d0400f4f1b5?w=600&h=400&fit=crop', 'Лучшая цена', '1.5T 147 л.с.', 'CVT', 'Передний', '{"winterPackage": "Нет", "ventilation": "Нет", "camera360": "Нет", "heatedSteeringWheel": "Да"}'::jsonb),
  ('Sportage', 'Kia', '15 490 000 ₸', 15490000, 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop', NULL, '2.0 MPI 150 л.с.', '6AT', 'Полный', '{"winterPackage": "Да", "ventilation": "Нет", "camera360": "Да", "heatedSteeringWheel": "Да"}'::jsonb);
