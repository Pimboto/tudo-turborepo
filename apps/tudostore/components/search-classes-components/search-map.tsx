// components/search-classes-components/search-map.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import dynamic from "next/dynamic";
import { MapMarker, Location } from "./types";
import { Dictionary } from "@/lib/dictionary";

// Dynamically import the Map component with no SSR
const MapComponent = dynamic(() => import("@/components/search-classes-components/map-component"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full flex items-center justify-center bg-gray-100"
      style={{ minHeight: "300px" }}
    >
      <p>Loading map...</p>
    </div>
  ),
});

interface SearchMapProps {
  mapCenter: [number, number];
  mapZoom: number;
  setMapZoom: (zoom: number | ((prev: number) => number)) => void;
  markers: MapMarker[];
  selectedMarker: string | null;
  onMarkerClick: (id: string) => void;
  onBoundsChange: (bounds: [[number, number], [number, number]]) => void;
  searchInArea: () => void;
  selectedLocation: Location | null;
  isClient: boolean;
  scriptLoaded: boolean;
  dictionary: Dictionary["searchClasses"]["map"];
}

const SearchMap = ({
  mapCenter,
  mapZoom,
  setMapZoom,
  markers,
  selectedMarker,
  onMarkerClick,
  onBoundsChange,
  searchInArea,
  selectedLocation,
  isClient,
  scriptLoaded,
  dictionary
}: SearchMapProps) => {
  return (
    <div
      className="w-full md:w-1/2 h-[50vh] md:h-auto relative border-t md:border-t-0 md:border-l"
      style={{ minHeight: "400px" }}
    >
      {isClient && scriptLoaded && (
        <>
          <div className="absolute inset-0 z-0">
            <MapComponent
              center={mapCenter}
              zoom={mapZoom}
              onBoundsChange={onBoundsChange}
              markers={markers}
              onMarkerClick={onMarkerClick}
              selectedMarker={selectedMarker}
            />
          </div>
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-md shadow-md"
              onClick={() => setMapZoom((prev: number) => Math.min(prev + 1, 18))}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-md shadow-md"
              onClick={() => setMapZoom((prev: number) => Math.max(prev - 1, 5))}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          {selectedLocation && (
            <Button
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] shadow-md bg-[#FF9422] text-[#FAFAFA] hover:bg-[#FF9422]/90"
              onClick={searchInArea}
            >
              {dictionary.searchInArea}
            </Button>
          )}
        </>
      )}
      {isClient && !scriptLoaded && (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <p>{dictionary.loadingResources}</p>
        </div>
      )}
    </div>
  );
};

export default SearchMap;
