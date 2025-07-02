// components/search-classes-components/filter-bar.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { MapPin, Filter, Building, Ruler, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Location, ActiveFilters } from "./types";
import { activeButtonClass } from "./constants";
import { searchLocations } from "./utils";
import { Dictionary } from "@/lib/dictionary";

interface FilterBarProps {
  location: string;
  setLocation: (location: string) => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  activeFilters: ActiveFilters;
  setActiveFilters: React.Dispatch<React.SetStateAction<ActiveFilters>>;
  distanceKm: number;
  setDistanceKm: (distance: number) => void;
  isDistanceActive: boolean;
  setIsDistanceActive: (active: boolean) => void;
  dictionary: Dictionary["searchClasses"]["filterBar"];
  filterOptions: {
    fitness: string[];
    activities: string[];
    facilities: string[];
  };
}

const FilterBar = ({
  location,
  setLocation,
  selectedLocation,
  setSelectedLocation,
  activeFilters,
  setActiveFilters,
  distanceKm,
  setDistanceKm,
  isDistanceActive,
  setIsDistanceActive,
  dictionary,
  filterOptions
}: FilterBarProps) => {
  const [searchText, setSearchText] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDistanceSlider, setShowDistanceSlider] = useState(false);

  // Toggle filter function
  const toggleFilter = useCallback((category: string, value: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[category as keyof ActiveFilters].includes(value)) {
        newFilters[category as keyof ActiveFilters] = newFilters[
          category as keyof ActiveFilters
        ].filter((v) => v !== value);
      } else {
        newFilters[category as keyof ActiveFilters] = [
          ...newFilters[category as keyof ActiveFilters],
          value,
        ];
      }
      return newFilters;
    });
  }, [setActiveFilters]);

  // Toggle distance slider
  const toggleDistanceSlider = useCallback(() => {
    setShowDistanceSlider((prev) => !prev);
  }, []);

  // Handle distance change
  const handleDistanceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      setDistanceKm(value);
      setIsDistanceActive(true);
    },
    [setDistanceKm, setIsDistanceActive]
  );

  // Real-time location search with debounce
  useEffect(() => {
    const fetchLocations = async () => {
      if (searchText.trim().length < 3) {
        setLocationSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchLocations(searchText);
        setLocationSuggestions(results);
      } catch (error) {
        console.error("Error searching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Delay the search to avoid too many requests
    const timeoutId = setTimeout(fetchLocations, 500);
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  return (
    <div className="sticky top-16 z-[1001] bg-background border-b p-4 shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Location filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(location && activeButtonClass)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span>{location || dictionary.location}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 z-[1002]" align="start">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={dictionary.searchLocation}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              {isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {dictionary.searching}
                </div>
              )}
              {locationSuggestions.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  {locationSuggestions.map((loc, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setLocation(loc.name);
                        setSelectedLocation({
                          name: loc.name,
                          lat: loc.lat,
                          lon: loc.lon,
                        });
                        setSearchText("");
                        setLocationSuggestions([]);
                      }}
                    >
                      {loc.fullName}
                    </div>
                  ))}
                </div>
              )}
              {!isLoading &&
                searchText.trim().length >= 3 &&
                locationSuggestions.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {dictionary.noLocationsFound}
                  </div>
                )}
            </PopoverContent>
          </Popover>

          {/* Fitness filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  activeFilters.fitness.length > 0 && activeButtonClass,
                  "flex items-center gap-2"
                )}
              >
                <Dumbbell className="h-4 w-4" />
                <span>{dictionary.fitness}</span>
                {activeFilters.fitness.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.fitness.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 z-[1002]">
              {filterOptions.fitness.map((option) => (
                <DropdownMenuItem
                  key={option}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleFilter("fitness", option)}
                >
                  <span>{option}</span>
                  {activeFilters.fitness.includes(option) && (
                    <div className="h-2 w-2 rounded-full bg-[#188686]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Activities filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  activeFilters.activities.length > 0 && activeButtonClass,
                  "flex items-center gap-2"
                )}
              >
                <Filter className="h-4 w-4" />
                <span>{dictionary.activities}</span>
                {activeFilters.activities.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.activities.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 z-[1002]">
              {filterOptions.activities.map((option) => (
                <DropdownMenuItem
                  key={option}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleFilter("activities", option)}
                >
                  <span>{option}</span>
                  {activeFilters.activities.includes(option) && (
                    <div className="h-2 w-2 rounded-full bg-[#188686]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Facilities filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  activeFilters.facilities.length > 0 && activeButtonClass,
                  "flex items-center gap-2"
                )}
              >
                <Building className="h-4 w-4" />
                <span>{dictionary.facilities}</span>
                {activeFilters.facilities.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.facilities.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 z-[1002]">
              {filterOptions.facilities.map((option) => (
                <DropdownMenuItem
                  key={option}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleFilter("facilities", option)}
                >
                  <span>{option}</span>
                  {activeFilters.facilities.includes(option) && (
                    <div className="h-2 w-2 rounded-full bg-[#188686]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Distance filter with slider */}
          <Popover
            open={showDistanceSlider}
            onOpenChange={setShowDistanceSlider}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  isDistanceActive && activeButtonClass,
                  "flex items-center gap-2"
                )}
                onClick={toggleDistanceSlider}
              >
                <Ruler className="h-4 w-4" />
                <span>{dictionary.distance}</span>
                {isDistanceActive && (
                  <Badge variant="secondary" className="ml-1">
                    {distanceKm} {dictionary.km}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 z-[1002]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{dictionary.distanceRange}</h4>
                  <span className="text-sm font-semibold bg-[#188686] text-white px-2 py-1 rounded-full">
                    {distanceKm} {dictionary.km}
                  </span>
                </div>
                <div className="pt-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={distanceKm}
                    onChange={handleDistanceChange}
                    className="w-full"
                    style={{
                      accentColor: "#188686",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 {dictionary.km}</span>
                  <span>10 {dictionary.km}</span>
                  <span>20 {dictionary.km}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search title */}
        <div className="text-lg font-medium hidden md:block">
          {location ? `${dictionary.gymsIn} ${location}` : dictionary.gymsAndFitness}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
