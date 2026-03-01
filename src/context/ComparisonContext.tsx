import { createContext, useContext, useState, ReactNode } from "react";
import type { Car } from "@/lib/mockData";

interface ComparisonContextType {
  selectedCars: Car[];
  toggleCar: (car: Car) => void;
  isSelected: (id: string) => boolean;
  clearAll: () => void;
}

const defaultValue: ComparisonContextType = {
  selectedCars: [],
  toggleCar: () => {},
  isSelected: () => false,
  clearAll: () => {},
};

const ComparisonContext = createContext<ComparisonContextType>(defaultValue);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);

  const toggleCar = (car: Car) => {
    setSelectedCars((prev) =>
      prev.find((c) => c.id === car.id)
        ? prev.filter((c) => c.id !== car.id)
        : prev.length < 3
        ? [...prev, car]
        : prev
    );
  };

  const isSelected = (id: string) => selectedCars.some((c) => c.id === id);
  const clearAll = () => setSelectedCars([]);

  return (
    <ComparisonContext.Provider value={{ selectedCars, toggleCar, isSelected, clearAll }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => useContext(ComparisonContext);
