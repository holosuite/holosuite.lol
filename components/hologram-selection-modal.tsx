"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, User, Loader2 } from "lucide-react";

interface Hologram {
  id: string;
  name: string;
  descriptions: string[];
  actingInstructions: string[];
  wardrobe: string[];
}

interface HologramSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holograms: Hologram[];
  simulationId: string;
  onRunCreated: (runId: string) => void;
}

export function HologramSelectionModal({
  isOpen,
  onClose,
  holograms,
  simulationId,
  onRunCreated,
}: HologramSelectionModalProps) {
  const [selectedHologram, setSelectedHologram] = useState<string | null>(null);
  const [isCreatingRun, setIsCreatingRun] = useState(false);

  const handleSelectHologram = async (hologramId: string) => {
    if (isCreatingRun) return;

    setIsCreatingRun(true);
    setSelectedHologram(hologramId);

    try {
      const response = await fetch(`/api/simulations/${simulationId}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hologramId }),
      });

      if (response.ok) {
        const data = await response.json();
        onRunCreated(data.runId);
        onClose();
        setSelectedHologram(null);
      } else {
        console.error("Failed to create run");
      }
    } catch (error) {
      console.error("Error creating run:", error);
    } finally {
      setIsCreatingRun(false);
      setSelectedHologram(null);
    }
  };

  const handleClose = () => {
    if (!isCreatingRun) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Choose Your Character
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select a character to play as in this interactive story. Each
            character has unique abilities and perspectives.
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {holograms.map((hologram) => (
            <Card
              key={hologram.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedHologram === hologram.id
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-4 h-4" />
                  {hologram.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Character Description */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Description:
                  </p>
                  <ul className="text-sm space-y-1">
                    {hologram.descriptions.slice(0, 3).map((desc, i) => (
                      <li key={i} className="text-muted-foreground">
                        • {desc}
                      </li>
                    ))}
                    {hologram.descriptions.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{hologram.descriptions.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Personality Traits */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Personality:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {hologram.actingInstructions.slice(0, 3).map((trait, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {trait.split(":")[0] || trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Wardrobe */}
                {hologram.wardrobe.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Equipment:
                    </p>
                    <ul className="text-sm space-y-1">
                      {hologram.wardrobe.slice(0, 2).map((item, i) => (
                        <li key={i} className="text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                      {hologram.wardrobe.length > 2 && (
                        <li className="text-xs text-muted-foreground">
                          +{hologram.wardrobe.length - 2} more items...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Select Button */}
                <Button
                  onClick={() => handleSelectHologram(hologram.id)}
                  disabled={isCreatingRun}
                  className="w-full"
                  variant={
                    selectedHologram === hologram.id ? "default" : "outline"
                  }
                >
                  {selectedHologram === hologram.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Story...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Play as {hologram.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {holograms.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No characters available for this story.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
