//components\search-classes-components\establishment-card.tsx
"use client";

import { Establishment } from "./types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinned, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface EstablishmentCardProps {
  establishment: Establishment;
  onClick: (id: string) => void;
  isSelected: boolean;
}

const EstablishmentCard = ({
  establishment,
  onClick,
  isSelected,
}: EstablishmentCardProps) => {
  return (
    <Card
      className={cn(
        "mb-4 cursor-pointer transition-all hover:shadow",
        isSelected ? "border-[#188686] bg-[#18868610]" : ""
      )}
      onClick={() => onClick(establishment.id)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">{establishment.name}</h3>
            <p className="text-sm text-muted-foreground">
              {establishment.address}
            </p>
            <div className="flex items-center mt-1 text-sm">
              <Badge className="bg-[#FF9422] hover:bg-[#FF9422]/90">
                {establishment.subtype}
              </Badge>
              <span className="ml-2 text-muted-foreground flex items-center">
                <MapPinned className="h-3 w-3 mr-1" /> {establishment.distance}{" "}
                km
              </span>
            </div>
          </div>
          <div className="text-amber-500 flex items-center">
            <Star className="h-4 w-4 fill-amber-500" />
            <span className="ml-1 font-semibold">{establishment.rating}</span>
          </div>
        </div>

        {establishment.facilities && establishment.facilities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {establishment.facilities.map((facility: string, index: number) => (
              <span
                key={index}
                className="text-xs bg-muted px-2 py-0.5 rounded"
              >
                {facility}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstablishmentCard;
