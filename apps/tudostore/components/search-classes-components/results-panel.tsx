// components/search-classes-components/results-panel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import EstablishmentCard from "./establishment-card";
import { Establishment, Location } from "./types";
import { RefObject } from "react";
import { Dictionary } from "@/lib/dictionary";

interface ResultsPanelProps {
  selectedLocation: Location | null;
  establishments: Establishment[];
  selectedEstablishment: string | null;
  handleEstablishmentClick: (id: string) => void;
  countActiveFilters: () => number;
  clearFilters: () => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  dictionary: Dictionary["searchClasses"]["resultsPanel"];
}

const ResultsPanel = ({
  selectedLocation,
  establishments,
  selectedEstablishment,
  handleEstablishmentClick,
  countActiveFilters,
  clearFilters,
  resultsRef,
  dictionary
}: ResultsPanelProps) => {
  return (
    <div className="w-full md:w-1/2 p-4 md:p-6">
      {!selectedLocation ? (
        <div className="flex flex-col items-start gap-4 mt-12">
          <h2 className="text-2xl font-bold">{dictionary.noResultsFound}</h2>
          <p className="text-muted-foreground">
            {dictionary.selectLocation}
          </p>
          {countActiveFilters() > 0 && (
            <Button
              className="mt-2 bg-[#188686] text-[#FAFAFA] hover:bg-[#188686]/90"
              onClick={clearFilters}
            >
              {dictionary.clearFilters}
            </Button>
          )}
        </div>
      ) : establishments.length === 0 ? (
        <div className="flex flex-col items-start gap-4 mt-8">
          <h2 className="text-2xl font-bold">{dictionary.noResultsFound}</h2>
          <p className="text-muted-foreground">
            {dictionary.adjustFilters}
          </p>
          {countActiveFilters() > 0 && (
            <Button
              className="mt-2 bg-[#188686] text-[#FAFAFA] hover:bg-[#188686]/90"
              onClick={clearFilters}
            >
              {dictionary.clearFilters}
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {establishments.length} {dictionary.resultsFound}
            </h2>
            {countActiveFilters() > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {dictionary.clearFilters}
              </Button>
            )}
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]" ref={resultsRef}>
            <div className="pr-4">
              {establishments.map((establishment) => (
                <div 
                  key={establishment.id}
                  id={`establishment-card-${establishment.id}`}
                >
                  <EstablishmentCard
                    establishment={establishment}
                    onClick={handleEstablishmentClick}
                    isSelected={establishment.id === selectedEstablishment}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
