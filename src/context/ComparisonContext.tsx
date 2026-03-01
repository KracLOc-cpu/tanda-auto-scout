import { createContext, useContext, useState, ReactNode } from "react";
import type { CarDB } from "@/hooks/useCars";

interface ComparisonContextType {
  selectedCars: CarDB[];
  toggleCar: (car: CarDB) => void;
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
  const [selectedCars, setSelectedCars] = useState<CarDB[]>([]);

  const toggleCar = (car: CarDB) => {
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
